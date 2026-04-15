$body = @"
{
  "packageId": "org.adalex.workly",
  "name": "Workly - Work Timer",
  "launcherName": "Workly",
  "appVersion": "1.0.0",
  "appVersionCode": 1,
  "display": "standalone",
  "orientation": "portrait",
  "themeColor": "#1a73e8",
  "themeColorDark": "#1558b0",
  "backgroundColor": "#f0f4f8",
  "navigationColor": "#1a73e8",
  "navigationColorDark": "#1558b0",
  "navigationDividerColor": "#1a73e8",
  "navigationDividerColorDark": "#1558b0",
  "host": "https://workly.adalex.org",
  "startUrl": "/",
  "webManifestUrl": "https://workly.adalex.org/manifest.json",
  "iconUrl": "https://workly.adalex.org/assets/icons/icon-512.png",
  "maskableIconUrl": "https://workly.adalex.org/assets/icons/icon-512.png",
  "monochromeIconUrl": null,
  "signingMode": "new",
  "signing": null,
  "fallbackType": "customtabs",
  "enableNotifications": false,
  "enableSiteSettingsShortcut": true,
  "isChromeOSOnly": false,
  "includeSourceCode": false,
  "splashScreenFadeOutDuration": 300,
  "additionalTrustedOrigins": [],
  "shortcuts": [],
  "features": {
    "locationDelegation": { "enabled": false },
    "playBilling": { "enabled": false }
  }
}
"@

Write-Host "Calling PWABuilder API..."
try {
    $response = Invoke-WebRequest `
        -Uri "https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 180

    Write-Host ("Status: " + $response.StatusCode)
    Write-Host ("Content-Length: " + $response.RawContentLength + " bytes")

    $outPath = "C:\inetpub\vhosts\workly\httpdocs\workly-android.zip"
    [System.IO.File]::WriteAllBytes($outPath, $response.Content)
    Write-Host ("Saved: " + $outPath)
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message)
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host ("Response body: " + $reader.ReadToEnd())
    }
}
