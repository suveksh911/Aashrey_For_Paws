describe("Pet Owner Module", () => {
  test("creates a pet listing", () => {
    const petOwner = { id: 7, role: "Pet Owner" };
    const listing = {
      ownerId: petOwner.id,
      petName: "Bruno",
      type: "Dog"
    };

    expect(listing.ownerId).toBe(7);
    expect(listing.petName).toBe("Bruno");
  });
});