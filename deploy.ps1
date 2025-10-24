# Azure Deployment Script for Roast Duels
# This script builds the project and prepares it for Azure deployment

Write-Host "Building project for production..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Copying web.config to dist folder..." -ForegroundColor Green
Copy-Item "web.config" "dist\web.config" -Force

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Deploy the contents of the 'dist' folder to your Azure App Service." -ForegroundColor Yellow
Write-Host "Make sure to deploy ONLY the contents of the dist folder, not the entire project." -ForegroundColor Yellow

Write-Host "`nFiles ready for deployment:" -ForegroundColor Cyan
Get-ChildItem "dist" | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }
