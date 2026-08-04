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
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['id_number']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unique(['id_number', 'academic_year_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['students_id_number_academic_year_id_unique']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unique('id_number');
        });
    }
};
