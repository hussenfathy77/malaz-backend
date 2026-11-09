# تشغيل الـ Migration وبذر البيانات (Seed) لقاعدة البيانات
# شغّل هذا الملف في PowerShell كـ Administrator لما تكون خدمة PostgreSQL شغّالة

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌱 Malaz Database Migration & Seed Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location C:\malaz\malaz-backend

# 1. تشغيل خدمة PostgreSQL إذا لم تكن قيد التشغيل
Write-Host "⏳ Checking PostgreSQL service..." -ForegroundColor Yellow
net start postgresql-x64-18 2>$null

# 2. تشغيل Prisma Migration
Write-Host "`n⏳ 1/3 Running Prisma migration..." -ForegroundColor Cyan
npx prisma migrate dev --name add_location_offline_circle_approval --skip-seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration succeeded!" -ForegroundColor Green
    
    # 3. توليد Prisma Client
    Write-Host "`n⏳ 2/3 Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    # 4. بذر البيانات التجريبية
    Write-Host "`n⏳ 3/3 Seeding database with test accounts & circles..." -ForegroundColor Cyan
    npx prisma db seed
    
    Write-Host "`n==========================================" -ForegroundColor Green
    Write-Host "🎉 Database is ready with all test accounts!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Admin:    admin@malaz.com          (Password123!)" -ForegroundColor White
    Write-Host "Doctor 1: ahmed.doctor@malaz.com   (Password123! - Verified ✅)" -ForegroundColor White
    Write-Host "Doctor 2: sara.doctor@malaz.com    (Password123! - Verified ✅)" -ForegroundColor White
    Write-Host "Doctor 3: pending.doctor@malaz.com (Password123! - Pending ⏳)" -ForegroundColor White
    Write-Host "Patient 1: omar.patient@malaz.com  (Password123!)" -ForegroundColor White
    Write-Host "Patient 2: layla.patient@malaz.com (Password123!)" -ForegroundColor White
    Write-Host "Caregiver: caregiver@malaz.com     (Password123!)" -ForegroundColor White
    Write-Host "`n🚀 Start backend with: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Migration failed. Please make sure PostgreSQL is running on port 5432." -ForegroundColor Red
    Write-Host "To start PostgreSQL service, run as Administrator: net start postgresql-x64-18" -ForegroundColor Yellow
}
