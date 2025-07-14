# Sounglah Deployment Script
Write-Host "🚀 Starting Sounglah deployment..." -ForegroundColor Green

# Step 1: Build the frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Copy build to server
Write-Host "📋 Copying frontend build to server..." -ForegroundColor Yellow
if (Test-Path "sounglah-server/frontend_build") {
    Remove-Item -Recurse -Force "sounglah-server/frontend_build"
}
Copy-Item -Recurse "sounglah-client-vite/dist" "sounglah-server/frontend_build"

# Step 3: Deploy to Fly.io
Write-Host "🚀 Deploying to Fly.io..." -ForegroundColor Yellow
Set-Location "sounglah-server"
fly deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}

# Return to root directory
Set-Location ".." 