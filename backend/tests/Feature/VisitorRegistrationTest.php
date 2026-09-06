<?php

use App\Models\VisitorRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    RateLimiter::clear('visitor-registrations');
});

function visitorPayload(array $overrides = []): array
{
    return array_merge([
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'purpose' => 'Delivery',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'National ID',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ], $overrides);
}

it('stores a visitor registration and returns 201 with record number', function () {
    $response = $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'purpose' => 'Meeting with faculty/staff',
        'purpose_other' => null,
        'person_office_to_visit' => "Registrar's Office",
        'id_type' => "Driver's License",
        'id_number' => 'D01-234567',
        'visit_date' => '2026-08-05',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.fullname', 'Juan Dela Cruz')
        ->assertJsonPath('data.visit_date', '2026-08-05')
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonStructure(['data' => ['id', 'record_no', 'fullname', 'status']]);

    $this->assertDatabaseHas('visitor_registrations', [
        'fullname' => 'Juan Dela Cruz',
        'status' => 'pending',
    ]);
});

it('persists the purpose other field when purpose is Other', function () {
    $response = $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Maria Santos',
        'contact' => '09171239876',
        'purpose' => 'Other',
        'purpose_other' => 'Internship interview',
        'person_office_to_visit' => 'Guidance Office',
        'id_type' => 'National ID',
        'id_number' => '1234-5678-9012',
        'visit_date' => '2026-08-06',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.purpose', 'Other')
        ->assertJsonPath('data.purpose_other', 'Internship interview');
});

it('validates required fields', function () {
    $this->postJson('/api/visitor-registrations', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['fullname', 'contact', 'purpose', 'person_office_to_visit', 'id_type', 'id_number', 'visit_date']);
});

it('rejects an invalid contact number', function () {
    $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '12345',
        'purpose' => 'Delivery',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'National ID',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['contact']);
});

it('rejects +639 prefixed contact numbers (must be 11 digits starting with 09)', function () {
    $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '+639171234567',
        'purpose' => 'Delivery',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'National ID',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['contact']);
});

it('rejects an unknown purpose of visit', function () {
    $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'purpose' => 'Hacking the system',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'National ID',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['purpose']);
});

it('rejects an unknown ID type', function () {
    $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'purpose' => 'Delivery',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'Library Card',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['id_type']);
});

it('requires a specification when purpose is Other', function () {
    $this->postJson('/api/visitor-registrations', [
        'fullname' => 'Juan Dela Cruz',
        'contact' => '09171234567',
        'purpose' => 'Other',
        'purpose_other' => '',
        'person_office_to_visit' => 'Registrar',
        'id_type' => 'National ID',
        'id_number' => '1234',
        'visit_date' => '2026-08-05',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['purpose_other']);
});

it('creates a registration via the factory', function () {
    $registration = VisitorRegistration::factory()->create();

    expect($registration->visit_date->format('Y-m-d'))->toBe($registration->visit_date->format('Y-m-d'))
        ->and($registration->status)->toBeIn(['pending', 'checked_in', 'checked_out']);
});

it('limits visitor registrations to 5 per hour per IP', function () {
    foreach (range(1, 5) as $i) {
        $this->postJson('/api/visitor-registrations', visitorPayload([
            'contact' => '0917000000'.$i,
        ]))->assertStatus(201);
    }

    $this->postJson('/api/visitor-registrations', visitorPayload([
        'contact' => '09170000006',
    ]))->assertStatus(429);
});

it('rejects submissions that fill the honeypot field', function () {
    $this->postJson('/api/visitor-registrations', visitorPayload([
        'website' => 'http://spam.example',
    ]))->assertStatus(422)
        ->assertJsonValidationErrors(['website']);
});

it('rejects a duplicate contact number for the same visit date', function () {
    $payload = visitorPayload();

    $this->postJson('/api/visitor-registrations', $payload)->assertStatus(201);
    $this->postJson('/api/visitor-registrations', $payload)->assertStatus(422)
        ->assertJsonValidationErrors(['contact']);
});

it('allows the same contact number on a different visit date', function () {
    $payload = visitorPayload();

    $this->postJson('/api/visitor-registrations', $payload)->assertStatus(201);
    $this->postJson('/api/visitor-registrations', visitorPayload([
        'visit_date' => '2026-08-06',
    ]))->assertStatus(201);
});
