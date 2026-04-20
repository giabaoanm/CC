# Kế hoạch triển khai ứng dụng điều tra sự cố an ninh mạng (UTF-8)

## 1) Mục tiêu bắt buộc
- Toàn bộ giao diện web, thông báo hệ thống, báo cáo điều tra phải hiển thị Tiếng Việt có dấu đầy đủ.
- Tất cả tệp mã nguồn, tệp cấu hình, mẫu báo cáo sử dụng mã hóa Unicode UTF-8.
- Ứng dụng chạy dạng portable trên Windows 10/11, phục vụ phát hiện và thu thập chứng cứ số.

## 2) Yêu cầu ngôn ngữ và mã hóa
- Ngôn ngữ mặc định: vi-VN.
- Không dùng chuỗi hardcode tiếng Anh trên giao diện chính.
- Cơ chế i18n vẫn được giữ để mở rộng sau này, nhưng vi-VN là mặc định bắt buộc.
- Chuẩn mã hóa:
  - Source code: UTF-8.
  - JSON/CSV xuất báo cáo: UTF-8.
  - PDF báo cáo: font hỗ trợ tiếng Việt Unicode.

## 3) Kiến trúc kỹ thuật
- Desktop portable: Tauri (Rust backend + Web frontend).
- Frontend: React + TypeScript + Vite.
- UI framework: Ant Design hoặc MUI (đồng nhất và chuyên nghiệp).
- Lưu trữ: SQLite (metadata vụ việc/chứng cứ).
- Thu thập dữ liệu: Windows Event Log, process, network, services, startup, scheduled tasks.

## 4) Mô-đun chức năng
- Quản lý vụ việc.
- Chọn máy đích/thư mục đích/tệp log cần phân tích.
- Thu thập chứng cứ với quyền Admin.
- Phân tích phát hiện dấu hiệu tấn công (rule-based).
- Timeline điều tra.
- Kho chứng cứ (hash SHA-256, manifest).
- Báo cáo điều tra tiếng Việt.

## 5) Kế hoạch 12 tuần
### Giai đoạn 1 (Tuần 1-2): Nền tảng
- Khởi tạo dự án Tauri + React + TypeScript.
- Thiết lập i18n vi-VN và bộ từ điển mặc định.
- Dựng khung giao diện chuyên nghiệp: Dashboard, Vụ việc, Thu thập, Phân tích, Báo cáo.

### Giai đoạn 2 (Tuần 3-4): Thu thập dữ liệu v1
- Thu thập Event Log local.
- Thu thập process/network/services/startup.
- Ghi dữ liệu vào SQLite + thư mục chứng cứ.

### Giai đoạn 3 (Tuần 5-6): Phát hiện v1
- Luật phát hiện brute-force.
- Luật phát hiện truy cập từ xa bất thường.
- Luật phát hiện leo thang đặc quyền cơ bản.

### Giai đoạn 4 (Tuần 7-8): Chuỗi chứng cứ
- Chain-of-custody.
- Audit trail thao tác người dùng.
- Timeline điều tra theo mốc thời gian.

### Giai đoạn 5 (Tuần 9-10): Dấu hiệu phá hoại/ransomware
- Nhận diện hành vi mã hóa bất thường.
- Cảnh báo xóa shadow copy, thao tác phá hoại hệ thống.

### Giai đoạn 6 (Tuần 11): Portable + kiểm định
- Build portable cho Windows 10/11.
- Kiểm thử quyền Admin/UAC.
- Kiểm thử hiển thị Unicode tiếng Việt.

### Giai đoạn 7 (Tuần 12): Nghiệm thu
- Kiểm thử nghiệp vụ.
- Chuẩn hóa mẫu báo cáo tiếng Việt.
- Chốt bản phát hành.

## 6) Chuẩn giao diện Tiếng Việt
- Tên màn hình, nút, cảnh báo, mô tả, tooltip, lỗi đều dùng tiếng Việt.
- Thuật ngữ nhất quán:
  - Incident -> Vụ việc
  - Evidence -> Chứng cứ
  - Collect -> Thu thập
  - Analyze -> Phân tích
  - Report -> Báo cáo

## 7) Chuẩn báo cáo Tiếng Việt
- Bìa báo cáo: mã vụ việc, đơn vị, điều tra viên, thời gian.
- Tóm tắt điều tra.
- Phân tích kỹ thuật theo mốc thời gian.
- Danh sách chứng cứ và hash.
- Kết luận và kiến nghị.

## 8) Cơ chế tự động triển khai
- Dùng script `scripts/auto-implement.ps1` để tự động hóa theo giai đoạn.
- Trạng thái thực hiện lưu ở `automation/status.json`.
- Kế hoạch máy đọc lưu ở `automation/plan.json`.

## 9) Tiêu chí nghiệm thu bắt buộc
- 100% giao diện người dùng chính: tiếng Việt có dấu.
- 100% mẫu báo cáo chuẩn: UTF-8.
- Chạy được ở Windows 10/11 chế độ portable.
- Có log/audit cho các thao tác thu thập và xuất chứng cứ.
