# PowerShell Script to Create PNG Placeholders

# Set paths
$pngDir = Join-Path -Path $PSScriptRoot -ChildPath "../public/images/png"

# Ensure the PNG directory exists
if (-not (Test-Path -Path $pngDir)) {
    New-Item -Path $pngDir -ItemType Directory | Out-Null
    Write-Host "Created output directory: $pngDir"
}

# Add reference to System.Drawing
Add-Type -AssemblyName System.Drawing

# Function to create a simple placeholder PNG
function CreatePlaceholderPNG {
    param (
        [string]$outputPath,
        [string]$text,
        [int]$width = 500,
        [int]$height = 200,
        [string]$bgColorHex = "#040B20",
        [string]$textColorHex = "#FFFFFF",
        [string]$subtitleColorHex = "#8A9FFF"
    )
    
    try {
        # Convert hex colors to System.Drawing.Color
        $bgColor = [System.Drawing.ColorTranslator]::FromHtml($bgColorHex)
        $textColor = [System.Drawing.ColorTranslator]::FromHtml($textColorHex)
        $subtitleColor = [System.Drawing.ColorTranslator]::FromHtml($subtitleColorHex)
        
        # Create bitmap
        $bitmap = New-Object System.Drawing.Bitmap $width, $height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Fill background
        $graphics.Clear($bgColor)
        
        # Create font and brushes
        $fontTitle = New-Object System.Drawing.Font "Arial", 24, [System.Drawing.FontStyle]::Bold
        $fontSubtitle = New-Object System.Drawing.Font "Arial", 12, [System.Drawing.FontStyle]::Regular
        $brushTitle = New-Object System.Drawing.SolidBrush $textColor
        $brushSubtitle = New-Object System.Drawing.SolidBrush $subtitleColor
        
        # Center text
        $stringFormat = New-Object System.Drawing.StringFormat
        $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        # Draw text
        $textRect = New-Object System.Drawing.RectangleF(0, ($height/2) - 20, $width, 40)
        $subtitleRect = New-Object System.Drawing.RectangleF(0, ($height/2) + 20, $width, 30)
        $graphics.DrawString($text, $fontTitle, $brushTitle, $textRect, $stringFormat)
        $graphics.DrawString("NOVA PROTOCOL", $fontSubtitle, $brushSubtitle, $subtitleRect, $stringFormat)
        
        # Save the bitmap
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Clean up
        $brushTitle.Dispose()
        $brushSubtitle.Dispose()
        $fontTitle.Dispose()
        $fontSubtitle.Dispose()
        $stringFormat.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
        
        Write-Host "Created PNG: $outputPath"
        return $true
    } catch {
        Write-Host "Error creating PNG: $_"
        return $false
    }
}

# Create PNG placeholders for each logo variant
$files = @(
    @{
        Name = "logo.png"
        Text = "NOVA"
        Width = 500
        Height = 500
    },
    @{
        Name = "logo-icon.png"
        Text = "N"
        Width = 200
        Height = 200
    },
    @{
        Name = "logo-text.png"
        Text = "NOVA"
        Width = 400
        Height = 150
    }
)

foreach ($file in $files) {
    $outputPath = Join-Path -Path $pngDir -ChildPath $file.Name
    
    CreatePlaceholderPNG -outputPath $outputPath -text $file.Text -width $file.Width -height $file.Height
}

# List the generated PNG files
$pngFiles = Get-ChildItem -Path $pngDir -Filter "*.png"
Write-Host "Generated $($pngFiles.Count) PNG files."
foreach ($pngFile in $pngFiles) {
    Write-Host " - $($pngFile.Name)"
} 