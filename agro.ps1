Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = "F:\Agro-vision"
$sharedVenvPath = "D:\agrovision"

# Check if shared venv exists, if not create it
if (-not (Test-Path "$sharedVenvPath\Scripts\python.exe")) {
    Write-Host "Creating shared virtual environment at $sharedVenvPath..." -ForegroundColor Cyan
    & "C:\Users\Rajnish Kumar\AppData\Local\Programs\Python\Python311\python.exe" -m venv $sharedVenvPath
    Write-Host "Shared venv created successfully!" -ForegroundColor Green
}

# Function to ensure pip and setuptools are installed in shared venv
function Initialize-SharedVenv {
    Write-Host "Initializing shared venv with pip and setuptools..." -ForegroundColor Cyan
    & "$sharedVenvPath\Scripts\Activate.ps1"
    & "$sharedVenvPath\Scripts\python.exe" -m ensurepip --upgrade
    & "$sharedVenvPath\Scripts\python.exe" -m pip install --upgrade pip setuptools wheel
    Write-Host "Shared venv initialized!" -ForegroundColor Green
}

# Initialize shared venv only once
Initialize-SharedVenv

$services = @(
    @{
        Name = "Gateway"
        Path = "F:\Agro-vision\agri-microservice\gateway"
        Command = '$env:REDIS_ENABLED="false"; npm run server'
        Type = "node"
    },
    @{
        Name = "Auth"
        Path = "F:\Agro-vision\agri-microservice\auth"
        Command = 'npm run dev'
        Type = "node"
    },
    @{
        Name = "History"
        Path = "F:\Agro-vision\agri-microservice\history"
        Command = 'npm run dev'
        Type = "node"
    },
    @{
        Name = "CropRec"
        Path = "F:\Agro-vision\agri-microservice\croprec"
        Command = "& `"$sharedVenvPath\Scripts\Activate.ps1`"; if (!(Test-Path requirements.installed)) { python -m pip install -r requirements.txt; New-Item -ItemType File -Path requirements.installed -Force }; python main.py"
        Type = "python"
    },
    @{
        Name = "Disease"
        Path = "F:\Agro-vision\agri-microservice\disease"
        Command = "& `"$sharedVenvPath\Scripts\Activate.ps1`"; if (!(Test-Path requirements.installed)) { python -m pip install -r requirements.txt; New-Item -ItemType File -Path requirements.installed -Force }; python main.py"
        Type = "python"
    },
    @{
        Name = "KrishiBot"
        Path = "F:\Agro-vision\agri-microservice\krishibot"
        Command = "& `"$sharedVenvPath\Scripts\Activate.ps1`"; if (!(Test-Path requirements.installed)) { python -m pip install -r requirements.txt; New-Item -ItemType File -Path requirements.installed -Force }; python -m app.main"
        Type = "python"
    },
    @{
        Name = "UI"
        Path = "F:\Agro-vision\frontend"
        Command = 'npm run dev'
        Type = "node"
    }
)

function Start-InWindowsTerminal {
    param(
        [Parameter(Mandatory = $true)] [array]$Items
    )

    $wt = Get-Command wt -ErrorAction SilentlyContinue
    if (-not $wt) {
        return $false
    }

    $args = @()
    for ($i = 0; $i -lt $Items.Count; $i++) {
        $item = $Items[$i]
        if ($i -gt 0) {
            $args += ";"
        }
        $args += "new-tab"
        $args += "--title"
        $args += $item.Name
        $args += "powershell"
        $args += "-NoExit"
        $args += "-Command"
        
        if ($item.Type -eq "python") {
            $args += "cd '$($item.Path)'; & '$sharedVenvPath\Scripts\Activate.ps1'; if (!(Test-Path requirements.installed)) { python -m pip install -r requirements.txt; New-Item -ItemType File -Path requirements.installed -Force }; python main.py"
        } else {
            $args += "cd '$($item.Path)'; $($item.Command)"
        }
    }

    Start-Process -FilePath $wt.Source -ArgumentList $args -WorkingDirectory $repoRoot | Out-Null
    return $true
}

function Start-InSeparatePowerShellWindows {
    param(
        [Parameter(Mandatory = $true)] [array]$Items
    )

    foreach ($item in $Items) {
        if ($item.Type -eq "python") {
            $psCommand = "cd '$($item.Path)'; & '$sharedVenvPath\Scripts\Activate.ps1'; if (!(Test-Path requirements.installed)) { python -m pip install -r requirements.txt; New-Item -ItemType File -Path requirements.installed -Force }; python main.py"
        } else {
            $psCommand = "cd '$($item.Path)'; $($item.Command)"
        }
        Start-Process powershell -ArgumentList @("-NoExit", "-Command", $psCommand) -WorkingDirectory $item.Path | Out-Null
    }
}

if (-not (Start-InWindowsTerminal -Items $services)) {
    Write-Host "Windows Terminal not found. Starting separate PowerShell windows..." -ForegroundColor Yellow
    Start-InSeparatePowerShellWindows -Items $services
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ All services launched with shared venv: $sharedVenvPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green