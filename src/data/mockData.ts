export interface Job {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  uploadedAt: string;
  completedAt?: string;
  pages: number;
  type: string;
}

export interface UsageData {
  used: number;
  limit: number;
  plan: "free" | "paid" | "enterprise";
  window: "daily" | "monthly";
}

export interface ResultField {
  key: string;
  value: string;
  confidence: number;
}

export interface ResultArtifact {
  jobId: string;
  fileName: string;
  inputPreviewUrl: string;
  overlayImageUrl: string;
  graphHtml: string;
  fields: ResultField[];
}

export const mockJobs: Job[] = [
  { id: "job-001", fileName: "invoice_march_2026.pdf", status: "completed", uploadedAt: "2026-03-10 09:15", completedAt: "2026-03-10 09:16", pages: 2, type: "Invoice" },
  { id: "job-002", fileName: "contract_nda.docx", status: "completed", uploadedAt: "2026-03-10 10:30", completedAt: "2026-03-10 10:32", pages: 8, type: "Contract" },
  { id: "job-003", fileName: "receipt_amazon.png", status: "processing", uploadedAt: "2026-03-12 08:00", pages: 1, type: "Receipt" },
  { id: "job-004", fileName: "tax_form_w2.pdf", status: "queued", uploadedAt: "2026-03-12 08:05", pages: 4, type: "Tax Form" },
  { id: "job-005", fileName: "corrupted_scan.pdf", status: "failed", uploadedAt: "2026-03-11 14:20", pages: 1, type: "Unknown" },
];

export const mockUsage: UsageData = {
  used: 4,
  limit: 5,
  plan: "free",
  window: "daily",
};

export const mockResults: ResultArtifact[] = [
  {
    jobId: "job-001",
    fileName: "invoice_march_2026.pdf",
    inputPreviewUrl: "https://picsum.photos/seed/pid-input-1/1000/620",
    overlayImageUrl: "https://picsum.photos/seed/pid-overlay-1/1000/620",
    graphHtml:
      "<html><body style='margin:0;background:#0f172a;color:#e2e8f0;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;'><div style='padding:16px;'><h3 style='margin:0 0 12px;'>P&ID Graph Preview</h3><svg width='100%' height='300' viewBox='0 0 600 300'><rect width='600' height='300' fill='#111827'/><circle cx='100' cy='150' r='28' fill='#22d3ee'/><rect x='210' y='122' width='95' height='56' rx='8' fill='#60a5fa'/><circle cx='430' cy='150' r='28' fill='#34d399'/><line x1='128' y1='150' x2='210' y2='150' stroke='#f8fafc' stroke-width='4'/><line x1='305' y1='150' x2='402' y2='150' stroke='#f8fafc' stroke-width='4' stroke-dasharray='8 6'/><text x='72' y='195' fill='#bae6fd' font-size='16'>P-101</text><text x='235' y='210' fill='#bfdbfe' font-size='16'>V-210</text><text x='405' y='195' fill='#bbf7d0' font-size='16'>E-330</text></svg></div></body></html>",
    fields: [
      { key: "Vendor", value: "Acme Corp", confidence: 0.98 },
      { key: "Invoice Number", value: "INV-2026-0342", confidence: 0.99 },
      { key: "Date", value: "March 5, 2026", confidence: 0.97 },
      { key: "Total", value: "$1,250.00", confidence: 0.99 },
      { key: "Due Date", value: "April 5, 2026", confidence: 0.95 },
    ],
  },
  {
    jobId: "job-002",
    fileName: "contract_nda.docx",
    inputPreviewUrl: "https://picsum.photos/seed/pid-input-2/1000/620",
    overlayImageUrl: "https://picsum.photos/seed/pid-overlay-2/1000/620",
    graphHtml:
      "<html><body style='margin:0;background:#0b1020;color:#e5e7eb;font-family:Segoe UI, sans-serif;'><div style='padding:16px;'><h3 style='margin:0 0 10px;'>Line Connectivity</h3><svg width='100%' height='300' viewBox='0 0 600 300'><rect width='600' height='300' fill='#0b1020'/><rect x='60' y='118' width='100' height='64' rx='8' fill='#38bdf8'/><rect x='260' y='118' width='100' height='64' rx='8' fill='#4ade80'/><rect x='460' y='118' width='100' height='64' rx='8' fill='#f59e0b'/><line x1='160' y1='150' x2='260' y2='150' stroke='#e2e8f0' stroke-width='4'/><line x1='360' y1='150' x2='460' y2='150' stroke='#e2e8f0' stroke-width='4'/><text x='76' y='210' fill='#7dd3fc'>Feed</text><text x='290' y='210' fill='#86efac'>Control</text><text x='486' y='210' fill='#fcd34d'>Output</text></svg></div></body></html>",
    fields: [
      { key: "Document Type", value: "Non-Disclosure Agreement", confidence: 0.96 },
      { key: "Party A", value: "Giza Global Inc.", confidence: 0.94 },
      { key: "Party B", value: "Client LLC", confidence: 0.93 },
      { key: "Effective Date", value: "March 1, 2026", confidence: 0.97 },
      { key: "Duration", value: "2 years", confidence: 0.91 },
    ],
  },
];
