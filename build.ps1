# Book Scribe Generator Build Script
Write-Host "Building Book Scribe Generator..." -ForegroundColor Green

# Check if .NET is installed
try {
    $dotnetVersion = dotnet --version
    Write-Host ".NET version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: .NET is not installed. Please install .NET 8.0 or later." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js 16.0 or later." -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location "book-scribe-generator"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install frontend dependencies." -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build frontend." -ForegroundColor Red
    exit 1
}

# Copy built frontend to .NET project
Write-Host "Copying frontend build to .NET project..." -ForegroundColor Yellow
Set-Location ".."
if (Test-Path "BookScribeGenerator.API/wwwroot") {
    Remove-Item "BookScribeGenerator.API/wwwroot" -Recurse -Force
}
Copy-Item "book-scribe-generator/dist" "BookScribeGenerator.API/wwwroot" -Recurse

# Build .NET backend
Write-Host "Building .NET backend..." -ForegroundColor Yellow
Set-Location "BookScribeGenerator.API"
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to restore .NET dependencies." -ForegroundColor Red
    exit 1
}

dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build .NET backend." -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "  cd BookScribeGenerator.API" -ForegroundColor White
Write-Host "  dotnet run" -ForegroundColor White
Write-Host "Then open http://localhost:5000 in your browser." -ForegroundColor Cyan 