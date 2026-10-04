# CV — Nguyễn Duy Phong · Customer Service Remote (Junior)

CV song ngữ (EN/VI), một trang A4, tối ưu ATS. Xây dựng bằng Vite + HTML/CSS thuần.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173  (?lang=en | ?lang=vi)
npm run build      # build web vào dist/ + tạo 2 file PDF A4 (EN, VI)
npm run preview    # xem bản production
npm run pdf        # chỉ tạo lại PDF từ dist/ hiện có
```

`npm run build` dùng Chrome/Edge headless để xuất:

- `dist/cv/Nguyen-Duy-Phong-CV-EN.pdf`
- `dist/cv/Nguyen-Duy-Phong-CV-VI.pdf`

(bản sao trong `public/cv/` để link tải hoạt động cả ở chế độ dev). Nếu Chrome nằm ở vị trí khác, đặt biến môi trường `CHROME_PATH`.

## Chỉnh sửa nội dung

Toàn bộ nội dung nằm trong `index.html`, gồm 2 khối `<article data-cv="en">` và `<article data-cv="vi">`. **Sửa cả hai khối** khi cập nhật thông tin, rồi chạy `npm run build` để tạo lại PDF.

- Thông tin liên hệ: thay các mục `[CONFIRM]`.
- Ảnh chân dung: chép ảnh vào `public/photo.jpg`, rồi thay nội dung `<div class="cv-photo">` bằng
  `<img src="photo.jpg" alt="Nguyễn Duy Phong" />` (ở cả 2 khối, bỏ `role="img"` và `aria-label`).
