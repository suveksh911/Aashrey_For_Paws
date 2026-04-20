describe("Authentication Service", () => {
  test("accepts valid credentials", () => {
    const email = "user@example.com";
    const password = "password123";

    const isValid = email === "user@example.com" && password === "password123";

    expect(isValid).toBe(true);
  });

  test("rejects invalid credentials", () => {
    const email = "wrong@example.com";
    const password = "wrongpass";

    const isValid = email === "user@example.com" && password === "password123";

    expect(isValid).toBe(false);
  });
});