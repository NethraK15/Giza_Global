export interface Job {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: string;
  completedAt?: string;
  pages: number;
  type: string;
}

export interface UsageData {
  used: number;
  limit: number;
  plan: "free" | "pro" | "enterprise";
}

export const mockJobs: Job[] = [
  { id: "job-001", fileName: "invoice_march_2026.pdf", status: "completed", uploadedAt: "2026-03-10 09:15", completedAt: "2026-03-10 09:16", pages: 2, type: "Invoice" },
  { id: "job-002", fileName: "contract_nda.docx", status: "completed", uploadedAt: "2026-03-10 10:30", completedAt: "2026-03-10 10:32", pages: 8, type: "Contract" },
  { id: "job-003", fileName: "receipt_amazon.png", status: "processing", uploadedAt: "2026-03-12 08:00", pages: 1, type: "Receipt" },
  { id: "job-004", fileName: "tax_form_w2.pdf", status: "pending", uploadedAt: "2026-03-12 08:05", pages: 4, type: "Tax Form" },
  { id: "job-005", fileName: "corrupted_scan.pdf", status: "failed", uploadedAt: "2026-03-11 14:20", pages: 1, type: "Unknown" },
];

export const mockUsage: UsageData = {
  used: 14,
  limit: 20,
  plan: "free",
};

export const mockResults = [
  {
    jobId: "job-001",
    fileName: "invoice_march_2026.pdf",
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
    fields: [
      { key: "Document Type", value: "Non-Disclosure Agreement", confidence: 0.96 },
      { key: "Party A", value: "Giza Global Inc.", confidence: 0.94 },
      { key: "Party B", value: "Client LLC", confidence: 0.93 },
      { key: "Effective Date", value: "March 1, 2026", confidence: 0.97 },
      { key: "Duration", value: "2 years", confidence: 0.91 },
    ],
  },
];
