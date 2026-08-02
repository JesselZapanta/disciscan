<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoomRequest;
use App\Http\Requests\Admin\UpdateRoomRequest;
use App\Http\Resources\Admin\RoomResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $rooms = Room::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = trim($request->input('search'));
                $query->where(function ($query) use ($search): void {
                    $query->where('room_name', 'like', "%{$search}%")
                        ->orWhere('building', 'like', "%{$search}%")
                        ->orWhere('floor', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->filled('status') && in_array($request->input('status'), ['Active', 'Inactive'], true),
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->when(
                $request->filled('building') && in_array($request->input('building'), StoreRoomRequest::BUILDINGS, true),
                fn ($query) => $query->where('building', $request->input('building'))
            )
            ->orderBy('id', $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate($request->integer('per_page', 10));

        return RoomResource::collection($rooms);
    }

    public function store(StoreRoomRequest $request): RoomResource|JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= 'Active';

        $room = Room::create($data);

        return (new RoomResource($room))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateRoomRequest $request, Room $room): RoomResource
    {
        $room->update($request->validated());

        return new RoomResource($room);
    }

    public function destroy(Request $request, Room $room): JsonResponse
    {
        $room->delete();

        return response()->json(['message' => 'Room deleted.']);
    }
}
