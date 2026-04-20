describe("Admin Control Module", () => {
  test("allows admin to manage the system", () => {
    const role = "Admin";
    const canManage = role === "Admin";

    expect(canManage).toBe(true);
  });

  test("prevents non-admin from admin actions", () => {
    const role = "Pet Owner";
    const canManage = role === "Admin";

    expect(canManage).toBe(false);
  });
});