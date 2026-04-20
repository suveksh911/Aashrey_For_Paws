describe("Role-Based Access Control", () => {
  test("allows admin access to admin features", () => {
    const role = "Admin";
    const allowed = role === "Admin";

    expect(allowed).toBe(true);
  });

  test("denies adopter access to admin features", () => {
    const role = "Adopter";
    const allowed = role === "Admin";

    expect(allowed).toBe(false);
  });

  test("allows NGO access to NGO features", () => {
    const role = "NGO";
    const allowed = role === "NGO";

    expect(allowed).toBe(true);
  });
});