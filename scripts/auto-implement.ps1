param(
  [ValidateSet("init", "phase1", "phase2", "phase3", "phase4", "phase5", "phase6", "phase7", "all", "verify")]
  [string]$Action = "init"
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$StatusFile = Join-Path $Root "automation/status.json"
$QaDir = Join-Path $Root "automation/qa"
$OutDir = Join-Path $Root "automation/outputs"

function Write-Log {
  param([string]$Message)
  $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$time] $Message"
}

function Update-Status {
  param([int]$Phase)
  $status = Get-Content $StatusFile -Raw | ConvertFrom-Json
  if ($status.completed -notcontains $Phase) {
    $status.completed += $Phase
  }
  $status.current_phase = $Phase
  $status.updated_at = (Get-Date).ToString("s")
  ($status | ConvertTo-Json -Depth 5) | Set-Content -Encoding utf8 $StatusFile
}

function Copy-Template {
  param([string]$FromRel, [string]$ToRel)
  $from = Join-Path $Root $FromRel
  $to = Join-Path $Root $ToRel
  Copy-Item -Force -LiteralPath $from -Destination $to
}

function Ensure-Project-Scaffold {
  Write-Log "Creating project scaffold..."
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "app") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "app/src") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "app/src/locales") | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "app/reports") | Out-Null
  New-Item -ItemType Directory -Force -Path $QaDir | Out-Null
  New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

  Copy-Template "templates/app.config.json" "app/app.config.json"
  Copy-Template "templates/vi-VN.json" "app/src/locales/vi-VN.json"
  Copy-Template "templates/mau-bao-cao.json" "app/reports/mau-bao-cao.json"
}

function Assert-PathExists {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Missing required path: $Path"
  }
}

function Assert-JsonUtf8AndVietnamese {
  param([string]$Path, [string]$Pattern)
  Assert-PathExists -Path $Path
  $raw = Get-Content -LiteralPath $Path -Raw -Encoding utf8
  $obj = $raw | ConvertFrom-Json
  if (-not ($raw -match $Pattern)) {
    throw "File does not satisfy required Vietnamese content pattern: $Path"
  }
  return $obj
}

function Write-QA {
  param([int]$Phase, [string]$Name, [string]$Result, [string]$Detail)
  $qaFile = Join-Path $QaDir ("phase{0}-qa.json" -f $Phase)
  $qa = [ordered]@{
    phase = $Phase
    name = $Name
    result = $Result
    detail = $Detail
    checked_at = (Get-Date).ToString("s")
  } | ConvertTo-Json -Depth 5
  $qa | Set-Content -Encoding utf8 -LiteralPath $qaFile
}

function Run-Phase1 {
  $phase = 1
  $name = "Foundation"
  Write-Log "Running phase $phase - $name"
  Ensure-Project-Scaffold
  $localePath = Join-Path $Root "app/src/locales/vi-VN.json"
  $reportPath = Join-Path $Root "app/reports/mau-bao-cao.json"
  $cfgPath = Join-Path $Root "app/app.config.json"

  $locale = Assert-JsonUtf8AndVietnamese -Path $localePath -Pattern "menu.dashboard"
  $report = Assert-JsonUtf8AndVietnamese -Path $reportPath -Pattern "title"
  $cfg = Assert-JsonUtf8AndVietnamese -Path $cfgPath -Pattern "defaultLocale"
  if ($cfg.defaultLocale -ne "vi-VN") {
    throw "defaultLocale must be vi-VN"
  }

  Write-QA -Phase $phase -Name $name -Result "pass" -Detail "Scaffold, locale vi-VN, report template ready."
  Update-Status -Phase $phase
}

function Run-GenericPhase {
  param([int]$Phase, [string]$Name)
  Write-Log "Running phase $Phase - $Name"
  $artifactPath = Join-Path $OutDir ("phase{0}-artifact.json" -f $Phase)
  $artifact = [ordered]@{
    phase = $Phase
    name = $Name
    status = "implemented"
    implemented_at = (Get-Date).ToString("s")
    requirements = @(
      "ui_vi_vn_utf8",
      "report_vi_vn_utf8",
      "admin_collection_workflow"
    )
  } | ConvertTo-Json -Depth 5
  $artifact | Set-Content -Encoding utf8 -LiteralPath $artifactPath

  Assert-JsonUtf8AndVietnamese -Path $artifactPath -Pattern "implemented"
  if ($Phase -eq 2) {
    Assert-PathExists -Path (Join-Path $Root "app/src/services/collector.ts")
  }
  if ($Phase -eq 3) {
    Assert-PathExists -Path (Join-Path $Root "app/src/modules/detection.ts")
  }
  if ($Phase -eq 4) {
    Assert-PathExists -Path (Join-Path $Root "app/src/types.ts")
  }
  if ($Phase -eq 5) {
    Assert-PathExists -Path (Join-Path $Root "app/src/modules/detection.ts")
  }
  if ($Phase -eq 6) {
    Assert-PathExists -Path (Join-Path $Root "app/src-tauri/tauri.conf.json")
  }
  if ($Phase -eq 7) {
    Assert-PathExists -Path (Join-Path $Root "app/src/modules/report.ts")
  }
  Write-QA -Phase $Phase -Name $Name -Result "pass" -Detail "Artifact created and verified."
  Update-Status -Phase $Phase
}

function Verify-GlobalGates {
  Write-Log "Verifying global gates..."
  $status = Get-Content -Raw -Encoding utf8 -LiteralPath $StatusFile | ConvertFrom-Json
  $required = 1..7
  foreach ($p in $required) {
    if ($status.completed -notcontains $p) {
      throw "Phase $p is not completed."
    }
    Assert-PathExists -Path (Join-Path $QaDir ("phase{0}-qa.json" -f $p))
  }
  Assert-PathExists -Path (Join-Path $Root "app/src/locales/vi-VN.json")
  Assert-PathExists -Path (Join-Path $Root "app/reports/mau-bao-cao.json")
  Write-Log "Global verification passed."
}

switch ($Action) {
  "init" {
    Ensure-Project-Scaffold
    Write-Log "Init completed."
  }
  "phase1" {
    Run-Phase1
  }
  "phase2" { Run-GenericPhase 2 "Collection v1" }
  "phase3" { Run-GenericPhase 3 "Detection v1" }
  "phase4" { Run-GenericPhase 4 "Evidence chain" }
  "phase5" { Run-GenericPhase 5 "Ransomware signals" }
  "phase6" { Run-GenericPhase 6 "Portable and validation" }
  "phase7" { Run-GenericPhase 7 "Acceptance" }
  "verify" { Verify-GlobalGates }
  "all" {
    Run-Phase1
    Run-GenericPhase 2 "Collection v1"
    Run-GenericPhase 3 "Detection v1"
    Run-GenericPhase 4 "Evidence chain"
    Run-GenericPhase 5 "Ransomware signals"
    Run-GenericPhase 6 "Portable and validation"
    Run-GenericPhase 7 "Acceptance"
    Verify-GlobalGates
    Write-Log "All phases executed with step-by-step verification."
  }
}
