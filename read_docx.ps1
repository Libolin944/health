$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open("c:\Users\48450\Desktop\1000ai应用\5家庭健康档案库\规划.docx")
    $text = $doc.Content.Text
    Write-Output $text
    $doc.Close()
} catch {
    Write-Output $_.Exception.Message
} finally {
    $word.Quit()
}