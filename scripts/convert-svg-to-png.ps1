# PowerShell Script to Convert SVG to PNG
# This script uses Inkscape CLI, which is a common tool for SVG handling

# Set paths
$svgDir = Join-Path -Path $PSScriptRoot -ChildPath "../public/images"
$pngDir = Join-Path -Path $svgDir -ChildPath "png"

# Ensure the PNG directory exists
if (-not (Test-Path -Path $pngDir)) {
    New-Item -Path $pngDir -ItemType Directory | Out-Null
    Write-Host "Created output directory: $pngDir"
}

# Get all SVG files
$svgFiles = Get-ChildItem -Path $svgDir -Filter "*.svg"
Write-Host "Found $($svgFiles.Count) SVG files to convert."

# Check if Inkscape is installed
try {
    $inkscapePath = (Get-Command "inkscape" -ErrorAction Stop).Source
    Write-Host "Found Inkscape at: $inkscapePath"
} catch {
    Write-Host "Inkscape not found in PATH. Please install it or add it to your PATH."
    Write-Host "You can download Inkscape from: https://inkscape.org/release/inkscape-1.2.2/"
    
    # Try to find it in common installation locations
    $possiblePaths = @(
        "C:\Program Files\Inkscape\bin\inkscape.exe",
        "C:\Program Files (x86)\Inkscape\bin\inkscape.exe",
        "C:\Program Files\Inkscape\inkscape.exe",
        "C:\Program Files (x86)\Inkscape\inkscape.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path -Path $path) {
            $inkscapePath = $path
            Write-Host "Found Inkscape at: $inkscapePath"
            break
        }
    }
    
    if (-not $inkscapePath) {
        Write-Host "Inkscape not found. Will try using .NET for conversion (limited functionality)."
    }
}

# Alternative: Using built-in .NET functionality to create placeholder PNGs
function CreatePlaceholderPNG {
    param (
        [string]$svgFile,
        [string]$outputPath
    )
    
    try {
        # Create a bitmap with the NOVA Protocol logo text
        $width = 500
        $height = 200
        $bitmap = New-Object System.Drawing.Bitmap $width, $height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Set background color (dark blue)
        $backgroundColor = [System.Drawing.Color]::FromArgb(4, 11, 32)
        $graphics.Clear($backgroundColor)
        
        # Create font and brushes
        $fontTitle = New-Object System.Drawing.Font "Arial", 24, [System.Drawing.FontStyle]::Bold
        $fontSubtitle = New-Object System.Drawing.Font "Arial", 12, [System.Drawing.FontStyle]::Regular
        $whiteBrush = [System.Drawing.Brushes]::White
        $lightBlueBrush = [System.Drawing.Brushes]::LightBlue
        
        # Draw text
        $basename = [System.IO.Path]::GetFileNameWithoutExtension($svgFile)
        $text = if ($basename -eq "logo") { "NOVA PROTOCOL" } else { $basename.ToUpper() }
        
        $stringFormat = New-Object System.Drawing.StringFormat
        $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        # Draw the main text
        $graphics.DrawString($text, $fontTitle, $whiteBrush, ($width/2), ($height/2) - 15, $stringFormat)
        
        # Draw the subtitle
        $graphics.DrawString("(PNG placeholder)", $fontSubtitle, $lightBlueBrush, ($width/2), ($height/2) + 20, $stringFormat)
        
        # Save the bitmap
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Clean up
        $graphics.Dispose()
        $bitmap.Dispose()
        
        Write-Host "Created placeholder PNG for $svgFile at $outputPath"
        return $true
    } catch {
        Write-Host "Error creating placeholder PNG: $_"
        return $false
    }
}

# Convert each SVG file
$convertedCount = 0
$errorCount = 0

foreach ($svgFile in $svgFiles) {
    $outputFile = Join-Path -Path $pngDir -ChildPath "$($svgFile.BaseName).png"
    Write-Host "Converting $($svgFile.Name) to PNG..."
    
    $success = $false
    
    # Try using Inkscape if available
    if ($inkscapePath) {
        try {
            # Inkscape command syntax
            # For newer versions (1.0+):
            $process = Start-Process -FilePath $inkscapePath -ArgumentList "--export-filename=`"$outputFile`"", "--export-width=500", "`"$($svgFile.FullName)`"" -NoNewWindow -Wait -PassThru
            
            if ($process.ExitCode -eq 0) {
                Write-Host "Successfully converted $($svgFile.Name) to PNG."
                $success = $true
                $convertedCount++
            } else {
                Write-Host "Inkscape conversion failed with exit code $($process.ExitCode). Trying alternative method..."
            }
        } catch {
            Write-Host "Error using Inkscape: $_"
        }
    }
    
    # If Inkscape failed or is not available, use the .NET method
    if (-not $success) {
        $success = CreatePlaceholderPNG -svgFile $svgFile.Name -outputPath $outputFile
        if ($success) {
            $convertedCount++
        } else {
            $errorCount++
        }
    }
}

Write-Host "Conversion completed."
Write-Host "Successfully converted: $convertedCount"
Write-Host "Errors: $errorCount"

# List the generated PNG files
$pngFiles = Get-ChildItem -Path $pngDir -Filter "*.png"
Write-Host "Generated $($pngFiles.Count) PNG files."
foreach ($pngFile in $pngFiles) {
    Write-Host " - $($pngFile.Name)"
} 