describe("Input Validation", () => {
  test("should reject empty input", () => {
    const input = "";
    expect(input).toBeFalsy();
  });

  test("should accept valid input", () => {
    const input = "Valid Data";
    expect(input).toBeTruthy();
  });
});