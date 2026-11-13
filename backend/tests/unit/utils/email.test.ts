import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import emailTexts from "../../../src/i18n/de/emails.json" with { type: "json" };

const { send } = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue({ data: { id: "mail-1" }, error: null }),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

// Resend and FROM_EMAIL are created when the module loads, so the env
// has to be set before each import.
async function loadEmailModule(env: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
  vi.stubEnv("FRONTEND_URL", "http://localhost:3001");
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("../../../src/utils/email.ts");
}

beforeEach(() => {
  send.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendVerificationEmail", () => {
  it("sends the verification mail to the given address", async () => {
    const { sendVerificationEmail } = await loadEmailModule();
    await sendVerificationEmail("user@example.com", "tok123");

    expect(send).toHaveBeenCalledTimes(1);
    const mail = send.mock.calls[0]![0];
    expect(mail.to).toBe("user@example.com");
    expect(mail.from).toBe("noreply@example.com");
    expect(mail.subject).toBe(emailTexts.verification.subject);
  });

  it("links to the frontend verify page with the token", async () => {
    const { sendVerificationEmail } = await loadEmailModule();
    await sendVerificationEmail("user@example.com", "tok123");

    const html: string = send.mock.calls[0]![0].html;
    expect(html).toContain(
      'href="http://localhost:3001/verify-email?token=tok123"'
    );
    expect(html).toContain(emailTexts.verification.heading);
    expect(html).toContain(emailTexts.verification.cta);
  });
});

describe("sendPasswordResetEmail", () => {
  it("sends the reset mail with the reset link", async () => {
    const { sendPasswordResetEmail } = await loadEmailModule();
    await sendPasswordResetEmail("user@example.com", "tok456");

    const mail = send.mock.calls[0]![0];
    expect(mail.to).toBe("user@example.com");
    expect(mail.subject).toBe(emailTexts.passwordReset.subject);
    expect(mail.html).toContain(
      'href="http://localhost:3001/reset-password?token=tok456"'
    );
  });

  it("uses the configured frontend url", async () => {
    const { sendPasswordResetEmail } = await loadEmailModule({
      FRONTEND_URL: "https://bag.example.org",
    });
    await sendPasswordResetEmail("user@example.com", "tok456");

    expect(send.mock.calls[0]![0].html).toContain(
      "https://bag.example.org/reset-password?token=tok456"
    );
  });
});

describe("sender address", () => {
  it("falls back to a default sender when RESEND_FROM_EMAIL is empty", async () => {
    const { sendVerificationEmail } = await loadEmailModule({
      RESEND_FROM_EMAIL: "",
    });
    await sendVerificationEmail("user@example.com", "tok");

    expect(send.mock.calls[0]![0].from).toMatch(/@/);
  });
  it("throws when Resend reports an error", async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "invalid from" },
    });
    const { sendVerificationEmail } = await loadEmailModule();

    await expect(
      sendVerificationEmail("user@example.com", "tok")
    ).rejects.toThrow("Email delivery failed");
  });
});
