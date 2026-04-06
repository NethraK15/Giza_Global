import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AuthPage from "@/pages/Auth";
import UploadPage from "@/pages/dashboard/UploadPage";
import JobsPage from "@/pages/dashboard/JobsPage";
import ResultsPage from "@/pages/dashboard/ResultsPage";
import BillingPage from "@/pages/dashboard/BillingPage";

describe("frontend critical path coverage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("auth: logs in and stores token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "token-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "qa@giza.ai" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/login",
        expect.objectContaining({ method: "POST" })
      );
      expect(localStorage.getItem("document-genie-token")).toBe("token-123");
    });
  });

  it("upload: accepts valid file and shows queued success state", async () => {
    localStorage.setItem("document-genie-token", "token-abc");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ jobId: "job-789" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<UploadPage />);

    const fileInput = screen.getByLabelText(/upload document file/i) as HTMLInputElement;
    const file = new File(["fake"], "diagram.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
      expect(screen.getByText(/job id: job-789/i)).toBeInTheDocument();
    });
  });

  it("status polling: queued jobs progress when polling runs", async () => {
    render(<JobsPage />);

    expect(screen.getByText(/job status/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Queued")).not.toBeInTheDocument();
    });
  });

  it("results rendering: shows selected result details and graph panel", async () => {
    render(<ResultsPage />);

    fireEvent.click(screen.getByRole("button", { name: /invoice_march_2026\.pdf/i }));

    expect(screen.getByText(/graph panel/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /json/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /csv/i })).toBeInTheDocument();
  });

  it("billing: plan limit messaging appears and upgrade updates billing status", async () => {
    localStorage.setItem(
      "document-genie-usage",
      JSON.stringify({ used: 5, limit: 5, plan: "free", window: "daily" })
    );

    render(<BillingPage />);

    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    expect(screen.getByText(/you're running low on uploads/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Upgrade to Paid$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /current plan active/i })).toBeInTheDocument();
      expect(screen.getByText(/paid plan/i)).toBeInTheDocument();
    });
  });
});
