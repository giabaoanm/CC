import type { CollectionRequest, CollectionResult, DetectionAlert } from "../types";

export interface InvestigationReport {
  maVuViec: string;
  thoiDiemLap: string;
  thongTinMucTieu: CollectionRequest;
  ketQuaThuThap: CollectionResult;
  canhBao: DetectionAlert[];
}

export function buildReport(
  request: CollectionRequest,
  collection: CollectionResult,
  alerts: DetectionAlert[]
): InvestigationReport {
  return {
    maVuViec: collection.caseCode || "CHUA_CAP_MA",
    thoiDiemLap: new Date().toISOString(),
    thongTinMucTieu: request,
    ketQuaThuThap: collection,
    canhBao: alerts
  };
}
