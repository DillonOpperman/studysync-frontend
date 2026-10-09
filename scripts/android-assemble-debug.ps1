# Portable Windows assemble helper. Does not change React Native versions.
# Cursor agent shells often set GRADLE_USER_HOME to a long sandbox cache that
# exceeds Ninja's 260-character limit on prefab Boost headers.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$android = Join-Path $root 'android'

if ($env:GRADLE_USER_HOME -match 'cursor-sandbox-cache') {
  $env:GRADLE_USER_HOME = Join-Path $env:USERPROFILE '.gradle'
}
if (-not $env:GRADLE_USER_HOME) {
  $env:GRADLE_USER_HOME = Join-Path $env:USERPROFILE '.gradle'
}

$jdk17 = 'C:\Program Files\Java\jdk-17'
if (-not $env:JAVA_HOME -or $env:JAVA_HOME -match 'jdk-25|Semeru') {
  if (Test-Path (Join-Path $jdk17 'bin\java.exe')) {
    $env:JAVA_HOME = $jdk17
  }
}
if ($env:JAVA_HOME) {
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

if (-not $env:ANDROID_HOME -and $env:ANDROID_SDK_ROOT) {
  $env:ANDROID_HOME = $env:ANDROID_SDK_ROOT
}
if (-not $env:ANDROID_HOME) {
  $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $defaultSdk) {
    $env:ANDROID_HOME = $defaultSdk
  }
}

Write-Host "GRADLE_USER_HOME=$env:GRADLE_USER_HOME"
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"

$cxx = Join-Path $android 'app\.cxx'
if (Test-Path $cxx) {
  $stale = Get-ChildItem -Path $cxx -Recurse -File -ErrorAction SilentlyContinue |
    Select-String -Pattern 'cursor-sandbox-cache' -List |
    Select-Object -First 1
  if ($stale) {
    Write-Host 'Removing stale CMake dir that still points at the sandbox Gradle cache'
    Remove-Item -LiteralPath $cxx -Recurse -Force
  }
}

Push-Location $android
try {
  & .\gradlew.bat assembleDebug @args
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
