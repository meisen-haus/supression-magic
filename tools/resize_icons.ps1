# Resize suppression spell icon for OpenMW (32px HUD + 256px spell menu).
# Usage: .\tools\resize_icons.ps1
#        .\tools\resize_icons.ps1 -Source "C:\full\path\to\supression_magic.png"

param(
    [string]$Source = (Join-Path (Split-Path $PSScriptRoot -Parent) 'supression_magic.png')
)

if (-not (Test-Path $Source)) {
    Write-Error "Source image not found: $Source`nPlace your art at supression_magic.png in the mod root, or pass -Source."
}

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'icons\s'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Save-Resized([string]$src, [string]$dest, [int]$size) {
    $img = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()
    $img.Dispose()
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $dest (${size}x${size})"
}

$small = Join-Path $outDir 'suppression_magic.png'
$big = Join-Path $outDir 'b_suppression_magic.png'
Save-Resized $Source $small 32
Save-Resized $Source $big 256
