<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table with initial data.
     */
    public function run(): void
    {
        $users = [
            // Core accounts
            [
                'name' => 'Kenley C. Broñola',
                'email' => 'kenley.bronola@example.com',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ],

            // Additional personnel
            [
                'name' => 'Kimberly Magsayo',
                'email' => 'kimberly.magsayo@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Yasser Rowaon',
                'email' => 'yasser.rowaon@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Romel G. Ondona',
                'email' => 'romel.ondona@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Marielle Sombilon',
                'email' => 'marielle.sombilon@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Jonas Ramos',
                'email' => 'jonas.ramos@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Andrei Cabahug',
                'email' => 'andrei.cabahug@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Kim Alforque',
                'email' => 'kim.alforque@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Liza Fernandez',
                'email' => 'liza.fernandez@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Gabriel Reyes',
                'email' => 'gabriel.reyes@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Andrea Cruz',
                'email' => 'andrea.cruz@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Miguel Torres',
                'email' => 'miguel.torres@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'David Park',
                'email' => 'david.park@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Angelica Rabanes',
                'email' => 'angelica.rabanes@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'John Mark Tiu',
                'email' => 'johnmark.tiu@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Princess Mae Dacua',
                'email' => 'princessmae.dacua@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Carlo Villanueva',
                'email' => 'carlo.villanueva@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Shiela Mae Latoreno',
                'email' => 'shielamae.latoreno@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Niño Mercado',
                'email' => 'nino.mercado@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Jessa Mae Amparo',
                'email' => 'jessamae.amparo@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Aljun Salazar',
                'email' => 'aljun.salazar@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Rosemarie Tormis',
                'email' => 'rosemarie.tormis@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Jomar Bantayan',
                'email' => 'jomar.bantayan@example.com',
                'role' => 'guard',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
