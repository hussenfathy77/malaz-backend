/*
  Warnings:

  - You are about to drop the column `schedule_date` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Appointment` table. All the data in the column will be lost.
  - The `status` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `risk_flag` on the `Journal` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `rating_value` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `category_name` on the `SafeCircle` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_online` on the `WorkingHours` table. All the data in the column will be lost.
  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Caregiver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CircleMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoodTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prescription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[appointment_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointment_id` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SafeCircle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'CAREGIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CaregiverStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "CircleRole" AS ENUM ('ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Caregiver" DROP CONSTRAINT "Caregiver_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Caregiver" DROP CONSTRAINT "Caregiver_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CircleMember" DROP CONSTRAINT "CircleMember_circle_id_fkey";

-- DropForeignKey
ALTER TABLE "CircleMember" DROP CONSTRAINT "CircleMember_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "MoodTracker" DROP CONSTRAINT "MoodTracker_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_ClinicalNote_id_fkey";

-- DropForeignKey
ALTER TABLE "WorkingHours" DROP CONSTRAINT "WorkingHours_doctor_id_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "schedule_date",
DROP COLUMN "type",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "recording_url" TEXT,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "certificate_url" TEXT,
ALTER COLUMN "session_price" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Journal" DROP COLUMN "risk_flag",
ADD COLUMN     "ai_feedback" TEXT;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "phone",
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "gender" TEXT,
ALTER COLUMN "date_of_birth" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "rating_value",
ADD COLUMN     "appointment_id" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SafeCircle" DROP COLUMN "category_name",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "preferred_language" TEXT NOT NULL DEFAULT 'ar',
ADD COLUMN     "profile_pic" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "WorkingHours" DROP COLUMN "is_online",
ALTER COLUMN "day_of_week" SET DATA TYPE TEXT,
ALTER COLUMN "start_time" SET DATA TYPE TEXT,
ALTER COLUMN "end_time" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Assessment";

-- DropTable
DROP TABLE "Caregiver";

-- DropTable
DROP TABLE "CircleMember";

-- DropTable
DROP TABLE "MedicalRecord";

-- DropTable
DROP TABLE "MoodTracker";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Prescription";

-- CreateTable
CREATE TABLE "CaregiverPatient" (
    "id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "consent_scope" TEXT NOT NULL,
    "status" "CaregiverStatus" NOT NULL DEFAULT 'PENDING',
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverPatient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "diagnosis" TEXT,
    "treatment_plan" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "mood_score" INTEGER NOT NULL,
    "note" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeCircleMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "circle_id" TEXT NOT NULL,
    "role" "CircleRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeCircleMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeCircleMessage" (
    "id" TEXT NOT NULL,
    "circle_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeCircleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverPatient_caregiver_id_patient_id_key" ON "CaregiverPatient"("caregiver_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalNote_appointment_id_key" ON "ClinicalNote"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "SafeCircleMember_user_id_circle_id_key" ON "SafeCircleMember"("user_id", "circle_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_appointment_id_key" ON "Review"("appointment_id");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverPatient" ADD CONSTRAINT "CaregiverPatient_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeCircleMember" ADD CONSTRAINT "SafeCircleMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeCircleMember" ADD CONSTRAINT "SafeCircleMember_circle_id_fkey" FOREIGN KEY ("circle_id") REFERENCES "SafeCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeCircleMessage" ADD CONSTRAINT "SafeCircleMessage_circle_id_fkey" FOREIGN KEY ("circle_id") REFERENCES "SafeCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeCircleMessage" ADD CONSTRAINT "SafeCircleMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
