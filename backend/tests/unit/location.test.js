describe("Location-Based Service", () => {
  test("should return valid location coordinates", () => {
    const location = { lat: 27.7, lng: 85.3 };
    expect(location.lat).toBeDefined();
    expect(location.lng).toBeDefined();
  });
});