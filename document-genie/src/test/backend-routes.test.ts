import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import app from "../../server/index.js";

describe("backend core routes", () => {
  const originalNow = Date.now;

  afterEach(() => {
    Date.now = originalNow;
  });

  it("covers auth + billing + upload + jobs + result flow", async () => {
    const signupEmail = `qa-${Date.now()}@giza.ai`;

    const signup = await request(app).post("/api/auth/signup").send({
      name: "QA User",
      email: signupEmail,
      password: "password123",
    });
    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeTypeOf("string");

    const login = await request(app).post("/api/auth/login").send({
      email: signupEmail,
      password: "password123",
    });
    expect(login.status).toBe(200);
    const token = login.body.token as string;
    expect(token).toBeTypeOf("string");

    const billing = await request(app)
      .get("/api/billing/subscription")
      .set("Authorization", `Bearer ${token}`);
    expect(billing.status).toBe(200);
    expect(billing.body.plan).toBe("free");

    const upgrade = await request(app)
      .post("/api/billing/upgrade")
      .set("Authorization", `Bearer ${token}`);
    expect(upgrade.status).toBe(200);
    expect(upgrade.body.plan).toBe("paid");

    const upload = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake png payload"), {
        filename: "diagram.png",
        contentType: "image/png",
      });
    expect(upload.status).toBe(201);
    expect(upload.body.status).toBe("queued");

    const createdJob = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ fileName: "result-ready.pdf", pages: 2, type: "application/pdf" });
    expect(createdJob.status).toBe(201);
    const createdJobId = createdJob.body.jobId as string;
    expect(createdJobId).toBeTypeOf("string");

    const jobs = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${token}`);
    expect(jobs.status).toBe(200);
    expect(Array.isArray(jobs.body.jobs)).toBe(true);
    expect(jobs.body.jobs.length).toBeGreaterThan(0);

    const currentNow = originalNow();
    Date.now = () => currentNow + 9000;

    const status = await request(app)
      .get(`/api/jobs/${createdJobId}/status`)
      .set("Authorization", `Bearer ${token}`);
    expect(status.status).toBe(200);
    expect(["processing", "completed", "failed"]).toContain(status.body.status);

    if (status.body.status !== "completed") {
      const status2 = await request(app)
        .get(`/api/jobs/${createdJobId}/status`)
        .set("Authorization", `Bearer ${token}`);
      expect(status2.status).toBe(200);
      expect(status2.body.status).toBe("completed");
    }

    const result = await request(app)
      .get(`/api/jobs/${createdJobId}/result`)
      .set("Authorization", `Bearer ${token}`);
    expect(result.status).toBe(200);
    expect(result.body.fileName).toBe("result-ready.pdf");
    expect(result.body.inputPreviewUrl).toBeTypeOf("string");
    expect(Array.isArray(result.body.fields)).toBe(true);
  });
});
