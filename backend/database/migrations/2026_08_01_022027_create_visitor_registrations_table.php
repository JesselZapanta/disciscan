<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visitor_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('fullname');
            $table->string('contact');
            $table->string('purpose');
            $table->string('purpose_other')->nullable();
            $table->string('person_office_to_visit');
            $table->string('id_type');
            $table->string('id_number');
            $table->date('visit_date');
            $table->string('type')->default('visitor');
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_registrations');
    }
};
