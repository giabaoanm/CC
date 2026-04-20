export interface CollectionRequest {
  targetAddress: string;
  targetFolder: string;
  logFile: string;
}

export interface CollectionResult {
  success: boolean;
  message: string;
  caseCode: string;
  startedAt: string;
}

export interface DetectionAlert {
  id: string;
  severity: "Thấp" | "Trung bình" | "Cao";
  title: string;
  detail: string;
  timestamp: string;
}
