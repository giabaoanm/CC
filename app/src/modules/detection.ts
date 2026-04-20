import type { CollectionRequest, DetectionAlert } from "../types";

function nowIso(): string {
  return new Date().toISOString();
}

export function detectFromRequest(input: CollectionRequest): DetectionAlert[] {
  const alerts: DetectionAlert[] = [];

  if (input.logFile.toLowerCase().includes("security")) {
    alerts.push({
      id: "ALERT-1001",
      severity: "Trung bình",
      title: "Phát hiện nguồn log bảo mật",
      detail: "Đã nạp tệp Security log để phân tích hành vi đăng nhập và đặc quyền.",
      timestamp: nowIso()
    });
  }

  if (input.targetAddress.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    alerts.push({
      id: "ALERT-2002",
      severity: "Thấp",
      title: "Mục tiêu dạng địa chỉ IP trực tiếp",
      detail: "Khuyến nghị đối chiếu thêm DNS và nhật ký truy cập từ xa.",
      timestamp: nowIso()
    });
  }

  if (input.targetFolder.toLowerCase().includes("bangchung")) {
    alerts.push({
      id: "ALERT-3100",
      severity: "Cao",
      title: "Thư mục chứng cứ chuyên dụng",
      detail: "Bật chế độ giám sát toàn vẹn tệp và ghi hash SHA-256 cho mọi bằng chứng.",
      timestamp: nowIso()
    });
  }

  return alerts;
}
