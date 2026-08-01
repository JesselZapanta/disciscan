<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVisitorRegistrationRequest;
use App\Http\Resources\VisitorRegistrationResource;
use App\Models\VisitorRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpFoundation\Response;

class VisitorRegistrationController extends Controller
{
    public function store(StoreVisitorRegistrationRequest $request): JsonResource|JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= 'pending';

        $registration = VisitorRegistration::create($data);

        return (new VisitorRegistrationResource($registration))->response()->setStatusCode(Response::HTTP_CREATED);
    }
}
