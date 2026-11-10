import { describe, it, expect, vi, afterEach } from "vitest";

import {
    hashPassword,
    verifyPassword,
} from "../../src/utils/password.ts"

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("hashPassword", () =>{
    it("returns a different hash each time for the same password (salted)", async () => {
        const a = await hashPassword("test");
        const b = await hashPassword("test");
        expect(a).not.toBe(b);
    });
    it("does not contain the plain password", async () => {
        expect(await hashPassword("test")).not.toContain("test");
    });
    it("uses argon2id with the configured parameters", async () => {
        expect(await hashPassword("test")).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });
});

describe("verifyPassword", () =>{
    it("returns true for correct password", async () => {
        expect(await verifyPassword(await hashPassword("test"), "test")).toBe(true);
    });
    it("returns false for a different password", async () => {
        expect(await verifyPassword(await hashPassword("test"), "Test")).toBe(false);
    });
    it("returns false for an empty password", async () => {
        expect(await verifyPassword(await hashPassword("test"), "")).toBe(false);
    });
    it("works with unicode passwords", async () => {
        const hash = await hashPassword("pässwörd-密码-🔐");
        expect(await verifyPassword(hash, "pässwörd-密码-🔐")).toBe(true);
    });
    it("returns false instead of throwing for a malformed hash", async () => {
        expect(await verifyPassword("not-a-valid-hash", "test")).toBe(false);
    });
});