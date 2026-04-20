import { FormEvent, useMemo, useState } from "react";
import { t } from "./i18n";
import { checkAdminPrivilege, startCollection } from "./services/collector";
import { detectFromRequest } from "./modules/detection";
import { buildReport } from "./modules/report";
import type { CollectionRequest, CollectionResult, DetectionAlert } from "./types";

type MenuId = "dashboard" | "case" | "collect" | "analyze" | "report";

export function App() {
  const [activeMenu, setActiveMenu] = useState<MenuId>("collect");
  const [adminReady, setAdminReady] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CollectionResult | null>(null);
  const [alerts, setAlerts] = useState<DetectionAlert[]>([]);
  const [form, setForm] = useState<CollectionRequest>({
    targetAddress: "",
    targetFolder: "",
    logFile: ""
  });

  const statusText = useMemo(() => {
    if (adminReady === null) return "Chưa kiểm tra quyền quản trị.";
    return adminReady ? "Quyền quản trị sẵn sàng." : "Không có quyền quản trị.";
  }, [adminReady]);

  async function onCheckAdmin() {
    setLoading(true);
    try {
      setAdminReady(await checkAdminPrivilege());
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const output = await startCollection(form);
      setResult(output);
      setAlerts(detectFromRequest(form));
    } finally {
      setLoading(false);
    }
  }

  function onExportReport() {
    if (!result) return;
    const report = buildReport(form, result, alerts);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-${report.maVuViec}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="app-title">Hệ thống điều tra sự cố</h1>
        <nav className="menu">
          <button className={activeMenu === "dashboard" ? "active" : ""} onClick={() => setActiveMenu("dashboard")}>
            {t("menu.dashboard")}
          </button>
          <button className={activeMenu === "case" ? "active" : ""} onClick={() => setActiveMenu("case")}>
            {t("menu.case")}
          </button>
          <button className={activeMenu === "collect" ? "active" : ""} onClick={() => setActiveMenu("collect")}>
            {t("menu.collect")}
          </button>
          <button className={activeMenu === "analyze" ? "active" : ""} onClick={() => setActiveMenu("analyze")}>
            {t("menu.analyze")}
          </button>
          <button className={activeMenu === "report" ? "active" : ""} onClick={() => setActiveMenu("report")}>
            {t("menu.report")}
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="top">
          <div>
            <p className="eyebrow">PHASE 1</p>
            <h2>Thu thập thông tin ban đầu</h2>
          </div>
          <button className="secondary" onClick={onCheckAdmin} disabled={loading}>
            Kiểm tra quyền Admin
          </button>
        </header>

        <section className="card">
          <form onSubmit={onSubmit} className="form">
            <label>
              {t("form.targetAddress")}
              <input
                type="text"
                placeholder="192.168.1.10 hoặc PC-KETOAN-01"
                value={form.targetAddress}
                onChange={(e) => setForm({ ...form, targetAddress: e.target.value })}
              />
            </label>

            <label>
              {t("form.targetFolder")}
              <input
                type="text"
                placeholder="C:\\BangChung\\VuViec_001"
                value={form.targetFolder}
                onChange={(e) => setForm({ ...form, targetFolder: e.target.value })}
              />
            </label>

            <label>
              {t("form.logFile")}
              <input
                type="text"
                placeholder="C:\\Windows\\System32\\winevt\\Logs\\Security.evtx"
                value={form.logFile}
                onChange={(e) => setForm({ ...form, logFile: e.target.value })}
              />
            </label>

            <button className="primary" type="submit" disabled={loading}>
              {t("button.start")}
            </button>
          </form>
        </section>

        <section className="grid">
          <article className="card">
            <h3>Trạng thái hệ thống</h3>
            <p>{statusText}</p>
          </article>
          <article className="card">
            <h3>Kết quả phiên thu thập</h3>
            {result ? (
              <div className="result">
                <p>
                  <strong>Mã vụ việc:</strong> {result.caseCode || "Chưa cấp mã"}
                </p>
                <p>
                  <strong>Thời điểm:</strong> {new Date(result.startedAt).toLocaleString("vi-VN")}
                </p>
                <p>{result.message}</p>
              </div>
            ) : (
              <p>Chưa có dữ liệu. Hãy khởi tạo một phiên thu thập.</p>
            )}
          </article>
        </section>

        <section className="grid">
          <article className="card">
            <h3>Cảnh báo phân tích ban đầu</h3>
            {alerts.length === 0 ? (
              <p>Chưa có cảnh báo. Hệ thống sẽ sinh cảnh báo sau khi thu thập.</p>
            ) : (
              alerts.map((a) => (
                <p key={a.id}>
                  <strong>[{a.severity}] {a.title}</strong> - {a.detail}
                </p>
              ))
            )}
          </article>
          <article className="card">
            <h3>Xuất báo cáo</h3>
            <p>Xuất báo cáo điều tra định dạng JSON UTF-8 tiếng Việt.</p>
            <button className="secondary" onClick={onExportReport} disabled={!result}>
              {t("button.export")}
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
