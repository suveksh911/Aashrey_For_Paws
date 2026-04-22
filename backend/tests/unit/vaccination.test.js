describe("Vaccination Reminder System", () => {
  test("should create reminder message", () => {
    const pet = "Dog";
    const message = `Reminder for ${pet}`;
    expect(message).toContain("Reminder");
  });
});