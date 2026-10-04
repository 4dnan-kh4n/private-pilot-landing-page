param([switch]$VerifyOnly)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

function Get-FileDigest([string]$filePath) {
    $stream = [IO.File]::OpenRead($filePath)
    $digest = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($digest.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
    finally { $digest.Dispose(); $stream.Dispose() }
}

# ponytail: native Windows packaging; add a portable packer when non-Windows builds are needed.
$projectRoot = Split-Path -Parent $PSScriptRoot
$extensionRoot = Join-Path (Split-Path -Parent $projectRoot) 'private-pilot-testing\extension'
$manifest = Get-Content -LiteralPath (Join-Path $extensionRoot 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.manifest_version -ne 3 -or $manifest.version -notmatch '^\d+(?:\.\d+){1,3}$') {
    throw 'Expected a Manifest V3 extension with a numeric Chrome version.'
}

# An explicit runtime file list keeps secrets, tests, and unrelated files out of the release.
$files = @(
    'manifest.json', 'service-worker.js', 'capture.js', 'pii.js', 'guard.js',
    'content-script.js', 'visual-overlay.js', 'visual.js', 'sidepanel.html',
    'sidepanel.css', 'sidepanel.js', 'privatepilot-logo.png',
    'icons/icon-16.png', 'icons/icon-32.png', 'icons/icon-48.png', 'icons/icon-128.png',
    'vendor/tesseract/tesseract.min.js',
    'vendor/tesseract/worker.min.js', 'vendor/tesseract/core/tesseract-core-lstm.wasm.js',
    'vendor/tesseract/core/tesseract-core-lstm.wasm', 'vendor/tesseract/lang/eng.traineddata.gz'
)
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $extensionRoot $file) -PathType Leaf)) {
        throw "Required extension file is missing: $file"
    }
}

$downloadDirectory = [IO.Path]::GetFullPath((Join-Path $projectRoot 'downloads'))
$fileName = "privatepilot-$($manifest.version).zip"
$archivePath = [IO.Path]::GetFullPath((Join-Path $downloadDirectory $fileName))
$temporaryPath = "$archivePath.tmp"
if (-not $archivePath.StartsWith($downloadDirectory + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Archive destination must stay inside the website downloads directory.'
}
$prefix = 'privatepilot-extension/'

if (-not $VerifyOnly) {
    New-Item -ItemType Directory -Path $downloadDirectory -Force | Out-Null
    $output = [IO.File]::Open($temporaryPath, [IO.FileMode]::Create)
    $zip = New-Object IO.Compression.ZipArchive($output, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $extensionRoot $file), $prefix + $file, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $PSScriptRoot 'INSTALL.txt'), $prefix + 'INSTALL.txt', [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    } finally { $zip.Dispose(); $output.Dispose() }
}

# Verify actual archive bytes, the manifest's entry points, and side-panel asset paths.
$checkPath = if ($VerifyOnly) { $archivePath } else { $temporaryPath }
$zip = [IO.Compression.ZipFile]::OpenRead($checkPath)
try {
    $expected = @($files) + 'INSTALL.txt'
    if ($zip.Entries.Count -ne $expected.Count) { throw 'Unexpected archive entry count.' }
    foreach ($entry in $zip.Entries) {
        if (-not $entry.FullName.StartsWith($prefix) -or $expected -notcontains $entry.FullName.Substring($prefix.Length)) {
            throw "Unexpected archive entry: $($entry.FullName)"
        }
    }
    foreach ($file in $expected) {
        $entry = $zip.GetEntry($prefix + $file)
        if ($null -eq $entry) { throw "Missing archive entry: $file" }
        $source = if ($file -eq 'INSTALL.txt') { Join-Path $PSScriptRoot $file } else { Join-Path $extensionRoot $file }
        $stream = $entry.Open()
        $hash = [Security.Cryptography.SHA256]::Create()
        try { $actualHash = [BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-', '') }
        finally { $hash.Dispose(); $stream.Dispose() }
        if ($actualHash.ToLowerInvariant() -ne (Get-FileDigest $source)) { throw "Archive bytes differ from source: $file" }
    }
    $required = @($manifest.background.service_worker, $manifest.side_panel.default_path)
    $required += $manifest.icons.PSObject.Properties.Value
    $required += $manifest.action.default_icon.PSObject.Properties.Value
    if ($manifest.PSObject.Properties.Name -contains 'content_scripts') {
        foreach ($script in $manifest.content_scripts) { $required += $script.js }
    }
    $html = Get-Content -LiteralPath (Join-Path $extensionRoot $manifest.side_panel.default_path) -Raw
    foreach ($match in [regex]::Matches($html, '(?:src|href)="([^"]+)"')) { $required += $match.Groups[1].Value }
    foreach ($file in $required) {
        if ($null -eq $zip.GetEntry($prefix + $file)) { throw "Referenced extension asset is missing: $file" }
    }
} finally { $zip.Dispose() }

$release = [ordered]@{
    version = $manifest.version
    fileName = $fileName
    sizeBytes = (Get-Item -LiteralPath $checkPath).Length
    sha256 = Get-FileDigest $checkPath
}
if ($VerifyOnly) {
    $recorded = Get-Content -LiteralPath (Join-Path $downloadDirectory 'release.json') -Raw | ConvertFrom-Json
    foreach ($key in $release.Keys) {
        if ($recorded.$key -ne $release[$key]) { throw "Release metadata mismatch: $key" }
    }
} else {
    Move-Item -LiteralPath $temporaryPath -Destination $archivePath -Force
    $metadataPath = Join-Path $downloadDirectory 'release.json'
    [IO.File]::WriteAllText($metadataPath, ($release | ConvertTo-Json), (New-Object Text.UTF8Encoding($false)))
    # Publish only the already verified ZIP and safe metadata for a portable Vercel build.
    $publicDownloads = Join-Path $projectRoot 'public\downloads'
    New-Item -ItemType Directory -Path $publicDownloads -Force | Out-Null
    Copy-Item -LiteralPath $archivePath -Destination (Join-Path $publicDownloads 'privatepilot.zip') -Force
    Copy-Item -LiteralPath $metadataPath -Destination (Join-Path $projectRoot 'src\release.json') -Force
}
Write-Output "$fileName verified: $($expected.Count) files, $($release.sizeBytes) bytes."
