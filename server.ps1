# RiskOS V2: Lightweight, Zero-Dependency PowerShell Web Server
# Allows running modern ES6 Modules locally without Node or Python.

$port = 8282
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "   RiskOS Board Risk Intelligence System   " -ForegroundColor Cyan -BackgroundColor DarkBlue
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Local web server running successfully!" -ForegroundColor Green
    Write-Host "Server Active on: http://127.0.0.1:$port/" -ForegroundColor White
    Write-Host "Double-click start.bat anytime to launch." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C in this terminal window to stop." -ForegroundColor Red
    Write-Host "------------------------------------------"
    
    # Auto-launch default browser unless the server is running as a hidden test helper.
    if (-not $env:NAVIS_NO_BROWSER) {
        Start-Process "http://127.0.0.1:$port/"
    }
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Parse local relative path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { 
            $urlPath = "/index.html" 
        }
        
        # Clean query parameters if any
        if ($urlPath.Contains("?")) {
            $urlPath = $urlPath.Substring(0, $urlPath.IndexOf("?"))
        }

        # Decode URL encoding safely using built-in [System.Uri] (always loaded)
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        
        $filePath = Join-Path $PSScriptRoot $urlPath

        # Serve the application shell for clean client-side routes.
        if (-not (Test-Path $filePath -PathType Leaf) -and [System.IO.Path]::GetExtension($urlPath) -eq "") {
            $filePath = Join-Path $PSScriptRoot "index.html"
        }
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content Type mappings
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "text/javascript" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            
            # CORS headers
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error starting local HTTP listener: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
}
