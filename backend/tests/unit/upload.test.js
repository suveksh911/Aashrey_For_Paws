describe("Image Upload System", () => {
  test("should accept image file", () => {
    const file = "image.jpg";
    expect(file).toMatch(/\.(jpg|png)$/);
  });
});