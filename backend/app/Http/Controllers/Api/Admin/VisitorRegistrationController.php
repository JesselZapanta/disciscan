<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\VisitorRegistrationResource;
use App\Models\VisitorRegistration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VisitorRegistrationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $registrations = VisitorRegistration::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('fullname', 'like', "%{$search}%")
                        ->orWhere('contact', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->filled('status') && $request->input('status') !== 'ALL',
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return VisitorRegistrationResource::collection($registrations);
    }
}
