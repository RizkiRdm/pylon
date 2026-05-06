import { expect, test, describe, beforeAll } from "bun:test";
import { encrypt, decrypt } from "./index";

describe("crypto", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_SECRET = "test-secret-key-at-least-32-chars-long-!!!";
  });

  test("should encrypt and decrypt correctly", () => {
    const text = "sk-ant-api03-xxxx-yyyy-zzzz";
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  test("should fail with wrong secret during decryption", () => {
    const text = "my-secret-token";
    const encrypted = encrypt(text);
    
    // Change secret
    process.env.ENCRYPTION_SECRET = "different-secret-key-!!!";
    
    expect(() => decrypt(encrypted)).toThrow();
  });
});
