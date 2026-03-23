# 08_refinement_pass_prompt

## Mục tiêu
Dùng sau khi đã chạy từng prompt module để Stitch AI cải thiện vòng 2.

## Prompt dùng lại
Hãy giữ nguyên cấu trúc nghiệp vụ và thông tin đã có. Thực hiện refinement pass theo checklist:
- Tăng tính nhất quán spacing, radius, elevation, icon size giữa các màn hình.
- Tối ưu visual hierarchy: CTA chính/phụ, heading/subheading, thông tin ưu tiên.
- Rà soát responsive trên 390x844, 834x1194, 1440x900; sửa các điểm vỡ layout.
- Tối ưu accessibility: contrast, focus ring, keyboard flow, touch target.
- Chuẩn hóa states: loading/empty/error/success/disabled cho mọi thành phần chính.
- Giảm nhiễu motion, chỉ giữ animation có giá trị định hướng.
- Đề xuất tinh chỉnh className Tailwind cụ thể cho các điểm yếu còn lại.

## Kỳ vọng output
- Danh sách cải tiến theo mức độ ưu tiên (High/Medium/Low).
- Bản cập nhật UI spec ngắn gọn, implementation-ready.
