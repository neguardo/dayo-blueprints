Add-Type -AssemblyName System.Drawing

function New-Canvas([bool]$transparent) {
  $bitmap = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear($(if ($transparent) { [System.Drawing.Color]::Transparent } else { [System.Drawing.ColorTranslator]::FromHtml('#061526') }))
  return @($bitmap, $graphics)
}

function Draw-DayoMark($graphics, [bool]$monochrome) {
  $cream = [System.Drawing.ColorTranslator]::FromHtml('#F7F3D9')
  $lime = if ($monochrome) { [System.Drawing.Color]::White } else { [System.Drawing.ColorTranslator]::FromHtml('#D4FF56') }
  $outline = if ($monochrome) { [System.Drawing.Color]::White } else { $cream }
  $outlinePen = New-Object System.Drawing.Pen $outline, 42
  $outlinePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $rayPen = New-Object System.Drawing.Pen $lime, 28
  $rayPen.StartCap = $rayPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $letter = New-Object System.Drawing.Drawing2D.GraphicsPath
  $letter.StartFigure()
  $letter.AddLine(220, 170, 480, 170)
  $letter.AddBezier(480, 170, 740, 170, 860, 310, 860, 500)
  $letter.AddBezier(860, 500, 860, 690, 740, 830, 480, 830)
  $letter.AddLine(480, 830, 220, 830)
  $letter.CloseFigure()
  $graphics.DrawPath($outlinePen, $letter)

  $sun = New-Object System.Drawing.Drawing2D.GraphicsPath
  $sun.StartFigure()
  $sun.AddLine(285, 770, 285, 770)
  $sun.AddBezier(285, 770, 315, 555, 710, 555, 790, 770)
  $sun.AddLine(790, 770, 285, 770)
  $sun.CloseFigure()
  $sunBrush = New-Object System.Drawing.SolidBrush $lime
  $sunPen = New-Object System.Drawing.Pen $outline, 26
  $sunPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $graphics.FillPath($sunBrush, $sun)
  $graphics.DrawPath($sunPen, $sun)

  $graphics.DrawLine($rayPen, 538, 430, 538, 340)
  $graphics.DrawLine($rayPen, 405, 470, 345, 395)
  $graphics.DrawLine($rayPen, 670, 470, 730, 395)
  $graphics.DrawLine($rayPen, 345, 590, 255, 565)
  $graphics.DrawLine($rayPen, 730, 590, 820, 565)

  $letter.Dispose(); $outlinePen.Dispose(); $rayPen.Dispose(); $sun.Dispose(); $sunBrush.Dispose(); $sunPen.Dispose()
}

function Save-Asset([string]$path, [bool]$transparent, [bool]$monochrome) {
  $canvas = New-Canvas $transparent
  $bitmap = $canvas[0]
  $graphics = $canvas[1]
  Draw-DayoMark $graphics $monochrome
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$assets = Join-Path $PSScriptRoot '..\assets'
Save-Asset (Join-Path $assets 'icon.png') $false $false
Save-Asset (Join-Path $assets 'favicon.png') $false $false
Save-Asset (Join-Path $assets 'splash-icon.png') $true $false
Save-Asset (Join-Path $assets 'android-icon-foreground.png') $true $false
Save-Asset (Join-Path $assets 'android-icon-monochrome.png') $true $true

$background = New-Canvas $false
$background[0].Save((Join-Path $assets 'android-icon-background.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$background[1].Dispose()
$background[0].Dispose()
