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

  it("resets free plan usage daily and blocks when quota exceeded", async () => {
    const baseNow = new Date("2026-05-01T08:00:00.000Z").getTime();
    Date.now = () => baseNow;

    const signupEmail = `daily-${baseNow}@giza.ai`;
    const signup = await request(app).post("/api/auth/signup").send({
      name: "Daily User",
      email: signupEmail,
      password: "password123",
    });
    const token = signup.body.token as string;

    for (let i = 0; i < 5; i += 1) {
      const upload = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(`fake-${i}`), {
          filename: `daily-${i}.png`,
          contentType: "image/png",
        });
      expect(upload.status).toBe(201);
    }

    const overQuota = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake-over"), {
        filename: "daily-over.png",
        contentType: "image/png",
      });
    expect(overQuota.status).toBe(429);
    expect(overQuota.body.usage.used).toBe(5);
    expect(overQuota.body.usage.limit).toBe(5);
    expect(overQuota.body.usage.window).toBe("daily");

    Date.now = () => baseNow + 24 * 60 * 60 * 1000 + 1000;

    const refreshedBilling = await request(app)
      .get("/api/billing/subscription")
      .set("Authorization", `Bearer ${token}`);
    expect(refreshedBilling.status).toBe(200);
    expect(refreshedBilling.body.usage.used).toBe(0);
    expect(refreshedBilling.body.usage.window).toBe("daily");
    expect(refreshedBilling.body.usage.periodStart).toBe("2026-05-02");
  });

  it("tracks paid plan usage monthly and resets on next month", async () => {
    const baseNow = new Date("2026-05-01T08:00:00.000Z").getTime();
    Date.now = () => baseNow;

    const signupEmail = `monthly-${baseNow}@giza.ai`;
    const signup = await request(app).post("/api/auth/signup").send({
      name: "Monthly User",
      email: signupEmail,
      password: "password123",
    });
    const token = signup.body.token as string;

    const upgrade = await request(app)
      .post("/api/billing/upgrade")
      .set("Authorization", `Bearer ${token}`);
    expect(upgrade.status).toBe(200);
    expect(upgrade.body.usage.window).toBe("monthly");
    expect(upgrade.body.usage.limit).toBe(1000);
    expect(upgrade.body.usage.used).toBe(0);

    for (let i = 0; i < 3; i += 1) {
      const upload = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(`monthly-${i}`), {
          filename: `monthly-${i}.png`,
          contentType: "image/png",
        });
      expect(upload.status).toBe(201);
    }

    const sameMonthBilling = await request(app)
      .get("/api/billing/subscription")
      .set("Authorization", `Bearer ${token}`);
    expect(sameMonthBilling.status).toBe(200);
    expect(sameMonthBilling.body.usage.used).toBe(3);
    expect(sameMonthBilling.body.usage.window).toBe("monthly");
    expect(sameMonthBilling.body.usage.periodStart).toBe("2026-05");

    Date.now = () => new Date("2026-06-01T00:00:01.000Z").getTime();

    const nextMonthBilling = await request(app)
      .get("/api/billing/subscription")
      .set("Authorization", `Bearer ${token}`);
    expect(nextMonthBilling.status).toBe(200);
    expect(nextMonthBilling.body.usage.used).toBe(0);
    expect(nextMonthBilling.body.usage.window).toBe("monthly");
    expect(nextMonthBilling.body.usage.periodStart).toBe("2026-06");
  });
});
