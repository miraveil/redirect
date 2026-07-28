# Hướng dẫn tự thay verification script và số lần redirect

Bạn chỉ cần chỉnh sửa một file:

```text
app/test-config.json
```

## 1. Thay đổi số lần redirect của URL gốc

Mở `app/test-config.json` và sửa dòng 2:

```json
"rootRedirectCount": 5
```

Giá trị hợp lệ là số nguyên từ `1` đến `50`.

Ví dụ:

- `3`: URL gốc redirect đúng 3 lần rồi đến trang chứa script.
- `5`: URL gốc redirect đúng 5 lần rồi đến trang chứa script.
- `6`: URL gốc redirect đúng 6 lần, phù hợp để kiểm tra trường hợp trên 5 lần.

Không cần sửa bất kỳ route nào khác. Hệ thống tự tính đường dẫn redirect đầu tiên.

## 2. Thay verification script

Mở `app/test-config.json` và thay toàn bộ nội dung bên phải
`verificationScriptHtml` ở dòng 3:

```json
"verificationScriptHtml": "<script async src='https://cdn.coad.be3pi.com/js/cox-site.js' co-pub='PUBLISHER_ID' co-st='SITE_ID' crossorigin='anonymous'></script>"
```

Quy tắc:

- Giữ toàn bộ script trên một dòng.
- Script phải có cả thẻ mở `<script ...>` và thẻ đóng `</script>`.
- Nên dùng dấu nháy đơn `'` bên trong script để có thể paste trực tiếp vào chuỗi JSON.
- Nếu script sử dụng dấu nháy kép `"`, phải đổi thành `\"` hoặc đổi các attribute sang dấu nháy đơn.
- Không sửa `app/result/[kind]/route.ts`; trang cuối tự lấy script từ file cấu hình.

## 3. Kiểm tra thay đổi trước khi push

Tại thư mục repository, chạy:

```bash
npm run lint
./node_modules/.bin/vinext build
node --test tests/rendered-html.test.mjs
```

Test tự động xác nhận:

- URL gốc có đúng số redirect trong `rootRedirectCount`.
- Trang cuối trả HTTP 200.
- Script cấu hình nằm trong `<head>`.
- Script không nằm trong `<body>` của trang hợp lệ.

## 4. Publish lên production

Commit và push file cấu hình:

```bash
git add app/test-config.json
git commit -m "Update redirect test configuration"
git push origin main
```

Cloudflare tự động build và deploy nhánh `main`. Chờ build hoàn thành trước khi
chạy Admin Site Owner Check Job.

## 5. Tự kiểm tra production

Kiểm tra số lần redirect:

```bash
curl -sSL -o /dev/null \
  -w "redirects=%{num_redirects}\nfinal=%{url_effective}\n" \
  https://redirect.mai-phan.workers.dev/
```

Kiểm tra script ở trang cuối:

```bash
curl -sSL https://redirect.mai-phan.workers.dev/ | grep "cox-site.js"
```

Kết quả cần thấy:

- `redirects` bằng `rootRedirectCount`.
- `final` là `https://redirect.mai-phan.workers.dev/result/valid`.
- HTML chứa đúng `co-pub` và `co-st` vừa cấu hình.

## 6. Tạo URL test riêng mà không thay URL gốc

Bạn có thể dùng:

```text
https://redirect.mai-phan.workers.dev/redirect/{number}?status=302&delay=0&target=valid
```

Ví dụ 6 redirect:

```text
https://redirect.mai-phan.workers.dev/redirect/6?status=302&delay=0&target=valid
```

Trang lab để tạo URL thủ công:

```text
https://redirect.mai-phan.workers.dev/lab
```
