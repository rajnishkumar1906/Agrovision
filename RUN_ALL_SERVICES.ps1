Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = "F:\Agro-vision"

$services = @(
    @{
        Name = "Gateway"
        Path = "F:\Agro-vision\agri-microservice\gateway"
        Command = '$env:REDIS_ENABLED="false"; npm run server'
    },
    @{
        Name = "Auth"
        Path = "F:\Agro-vision\agri-microservice\auth"
        Command = 'npm run dev'
    },
    @{
        Name = "History"
        Path = "F:\Agro-vision\agri-microservice\history"
        Command = 'npm run dev'
    },
    @{
        Name = "CropRec"
        Path = "F:\Agro-vision\agri-microservice\croprec"
        Command = 'if (!(Test-Path ".\.venv\Scripts\python.exe")) { python -m venv .venv }; .venv\Scripts\activate; python -m pip install --upgrade pip setuptools wheel; python -m pip install -r requirements.txt; python main.py'
    },
    @{
        Name = "Disease"
        Path = "F:\Agro-vision\agri-microservice\disease"
        Command = 'if (!(Test-Path ".\.venv\Scripts\python.exe")) { python -m venv venv }; .\.venv\Scripts\Activate.ps1; python -m pip install --upgrade pip setuptools wheel; python -m pip install -r requirements.txt; python main.py'
    },
    @{
        Name = "krishibot"
        Path = "F:\Agro-vision\agri-microservice\krishibot"
        Command = 'if (!(Test-Path ".\.venv\Scripts\python.exe")) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; python -m pip install --upgrade pip setuptools wheel; python -m pip install -r requirements.txt; python -m app.main'
    },
    @{
        Name = "UI"
        Path = "F:\Agro-vision\frontend"
        Command = 'npm run dev'
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
        $args += "cd '$($item.Path)'; $($item.Command)"
    }

    Start-Process -FilePath $wt.Source -ArgumentList $args -WorkingDirectory $repoRoot | Out-Null
    return $true
}

function Start-InSeparatePowerShellWindows {
    param(
        [Parameter(Mandatory = $true)] [array]$Items
    )

    foreach ($item in $Items) {
        $psCommand = "cd '$($item.Path)'; $($item.Command)"
        Start-Process powershell -ArgumentList @("-NoExit", "-Command", $psCommand) -WorkingDirectory $item.Path | Out-Null
    }
}

if (-not (Start-InWindowsTerminal -Items $services)) {
    Write-Host "Windows Terminal not found. Starting separate PowerShell windows..." -ForegroundColor Yellow
    Start-InSeparatePowerShellWindows -Items $services
}

Write-Host "Launched all services." -ForegroundColor Green
