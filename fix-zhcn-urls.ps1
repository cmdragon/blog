Get-ChildItem -Path "e:\Users\lenovo\Desktop\cenmilo\blog\content\posts\tweets\zh-CN" -Filter *.md | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    if ($content -match 'url: /posts/') {
        $newContent = $content -replace 'url: /posts/', 'url: /zh-cn/posts/'
        Set-Content -Path $file -Value $newContent -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}
Write-Host "Done!"
