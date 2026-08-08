<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\StudentImportRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Http\Resources\Admin\StudentResource;
use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class StudentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $students = Student::query()
            ->with('academicYear')
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('id_number', 'like', "%{$search}%")
                        ->orWhere('firstname', 'like', "%{$search}%")
                        ->orWhere('middlename', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('extension', 'like', "%{$search}%")
                        ->orWhere('contact_no', 'like', "%{$search}%")
                        ->orWhere('program_and_year', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('academic_year_id'), fn ($query) => $query->where('academic_year_id', $request->integer('academic_year_id')))
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return StudentResource::collection($students);
    }

    public function store(StoreStudentRequest $request): StudentResource|JsonResponse
    {
        $student = Student::create($request->validated());
        $student->load('academicYear');

        return (new StudentResource($student))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function import(StudentImportRequest $request): JsonResponse
    {
        $file = $request->file('file');

        try {
            $rows = IOFactory::load($file->getRealPath())->getActiveSheet()->toArray();
        } catch (Throwable) {
            return response()->json([
                'message' => 'Could not read the Excel file. Make sure it is a valid .xlsx workbook.',
                'errors' => ['file' => ['Could not read the Excel file. Make sure it is a valid .xlsx workbook.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (count($rows) < 2) {
            return response()->json([
                'message' => 'The file must contain a header row and at least one student row.',
                'errors' => ['file' => ['The file must contain a header row and at least one student row.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $expectedHeaders = ['id_number', 'firstname', 'middlename', 'lastname', 'extension', 'contact_no', 'program_and_year', 'academic_year_id'];
        $foundHeaders = array_map(fn ($cell) => strtolower($this->normalizeCell($cell)), $rows[0]);

        if ($foundHeaders !== $expectedHeaders) {
            return response()->json([
                'message' => 'The file header does not match the required format. Expected: '.implode(', ', $expectedHeaders).'. Found: '.implode(', ', $foundHeaders).'.',
                'errors' => ['file' => ['The file header does not match the required format. Expected: '.implode(', ', $expectedHeaders).'. Found: '.implode(', ', $foundHeaders).'.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        array_shift($rows);

        $idNumbers = array_values(array_unique(array_filter(array_map(
            fn ($row) => $this->normalizeCell($row[0] ?? ''),
            $rows
        ))));

        $existingIds = collect();
        foreach (array_chunk($idNumbers, 1000) as $chunk) {
            $existingIds = $existingIds->merge(
                Student::whereIn('id_number', $chunk)->get(['id_number', 'academic_year_id'])
                    ->map(fn (Student $student) => $student->id_number.'|'.($student->academic_year_id ?? ''))
            );
        }
        $existingIds = $existingIds->flip();

        $existingYearIds = AcademicYear::query()->pluck('id')->flip();

        $inserts = [];
        $reportRows = [];
        $processed = 0;
        $imported = 0;
        $skippedDuplicates = 0;
        $failed = 0;
        $seen = [];

        foreach ($rows as $index => $row) {
            [$idNumber, $firstname, $middlename, $lastname, $extension, $contactNo, $programAndYear, $academicYearId] = array_map(
                fn ($cell) => $this->normalizeCell($cell),
                array_pad($row, 8, '')
            );

            if ($idNumber === '' && $firstname === '' && $lastname === '') {
                continue;
            }

            $processed++;

            $duplicateKey = $idNumber.'|'.($academicYearId === '' ? '' : $academicYearId);

            if (isset($seen[$duplicateKey]) || isset($existingIds[$duplicateKey])) {
                $skippedDuplicates++;
                $reportRows[] = $this->reportRow($index, $idNumber, $firstname, $lastname, $extension, 'Duplicate ID number in the same academic year', 'duplicate');

                continue;
            }

            $reason = $this->rowValidationReason($idNumber, $firstname, $lastname, $contactNo, $programAndYear, $academicYearId, $existingYearIds);
            if ($reason !== null) {
                $failed++;
                $reportRows[] = $this->reportRow($index, $idNumber, $firstname, $lastname, $extension, $reason, 'invalid');

                continue;
            }

            $seen[$duplicateKey] = true;
            $inserts[] = [
                'id_number' => $idNumber,
                'firstname' => $firstname,
                'middlename' => $middlename === '' ? null : $middlename,
                'lastname' => $lastname,
                'extension' => $extension === '' ? null : $extension,
                'contact_no' => $contactNo,
                'program_and_year' => $programAndYear,
                'academic_year_id' => $academicYearId === '' ? null : (int) $academicYearId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $imported++;
        }

        DB::transaction(function () use ($inserts): void {
            foreach (array_chunk($inserts, 1000) as $chunk) {
                Student::insert($chunk);
            }
        });

        return response()->json([
            'message' => 'Import completed.',
            'report' => [
                'total' => $processed,
                'imported' => $imported,
                'skipped_duplicates' => $skippedDuplicates,
                'failed' => $failed,
                'rows' => $reportRows,
            ],
        ]);
    }

    public function importTemplate(): Response
    {
        $path = storage_path('app/templates/DISCISCAN-student-import-template.xlsx');

        return response()->download($path, 'DISCISCAN-student-import-template.xlsx');
    }

    public function update(UpdateStudentRequest $request, Student $student): StudentResource
    {
        $student->update($request->validated());
        $student->load('academicYear');

        return new StudentResource($student);
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        if ($student->timeLogs()->exists() || $student->violations()->exists()) {
            return response()->json([
                'message' => 'This student has time logs or violation records and cannot be deleted.',
                'errors' => ['status' => ['This student has time logs or violation records and cannot be deleted.']],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $student->delete();

        return response()->json(['message' => 'Student deleted.']);
    }

    private function normalizeCell(mixed $cell): string
    {
        return trim((string) $cell);
    }

    private function rowValidationReason(
        string $idNumber,
        string $firstname,
        string $lastname,
        string $contactNo,
        string $programAndYear,
        string $academicYearId,
        Collection $existingYearIds
    ): ?string {
        if ($idNumber === '') {
            return 'Missing ID number';
        }

        if ($firstname === '') {
            return 'Missing first name';
        }

        if ($lastname === '') {
            return 'Missing last name';
        }

        if ($contactNo === '') {
            return 'Missing contact number';
        }

        if (! preg_match('/^[0-9+\-\s]+$/', $contactNo)) {
            return 'Invalid contact number format';
        }

        if ($programAndYear === '') {
            return 'Missing program and year';
        }

        if ($academicYearId !== '' && ! isset($existingYearIds[(int) $academicYearId])) {
            return 'Unknown academic year';
        }

        return null;
    }

    private function reportRow(int $index, string $idNumber, string $firstname, string $lastname, string $extension, string $reason, string $type): array
    {
        return [
            'row' => $index + 2,
            'id_number' => $idNumber,
            'name' => trim($firstname.' '.$lastname.' '.$extension),
            'reason' => $reason,
            'type' => $type,
        ];
    }
}
