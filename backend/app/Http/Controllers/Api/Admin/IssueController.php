<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreIssueRequest;
use App\Http\Requests\Admin\UpdateIssueRequest;
use App\Http\Resources\Admin\IssueResource;
use App\Models\Issue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class IssueController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $issues = Issue::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->filled('status') && in_array($request->input('status'), StoreIssueRequest::STATUSES, true),
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return IssueResource::collection($issues);
    }

    public function store(StoreIssueRequest $request): IssueResource|JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= 'Active';

        $issue = Issue::create($data);

        return (new IssueResource($issue))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateIssueRequest $request, Issue $issue): IssueResource
    {
        $issue->update($request->validated());

        return new IssueResource($issue);
    }

    public function destroy(Request $request, Issue $issue): JsonResponse
    {
        $issue->delete();

        return response()->json(['message' => 'Issue deleted.']);
    }
}
