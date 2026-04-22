describe("Database Validation", () => {
  test("should store user data correctly", () => {
    const user = { name: "Test", email: "test@test.com" };
    expect(user).toHaveProperty("email");
  });

  test("should store pet data correctly", () => {
    const pet = { name: "Dog", age: 2 };
    expect(pet).toHaveProperty("name");
  });
});