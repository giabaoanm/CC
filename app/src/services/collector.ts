import type { CollectionRequest, CollectionResult } from "../types";

function buildCaseCode(): string {
  const now = new Date();
  return `CASE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function checkAdminPrivilege(): Promise<boolean> {
  return true;
}

export async function startCollection(request: CollectionRequest): Promise<CollectionResult> {
  if (!request.targetAddress || !request.targetFolder || !request.logFile) {
    return {
      success: false,
      message: "Thiếu thông tin đầu vào cho tác vụ thu thập.",
      caseCode: "",
      startedAt: new Date().toISOString()
    };
  }

  return {
    success: true,
    message: "Đã khởi tạo phiên thu thập chứng cứ thành công.",
    caseCode: buildCaseCode(),
    startedAt: new Date().toISOString()
  };
}
