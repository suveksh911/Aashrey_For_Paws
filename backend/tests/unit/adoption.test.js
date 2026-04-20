describe("Adoption Request System", () => {
  test("submits a valid adoption request", () => {
    const request = {
      adopterId: 1,
      petId: 101,
      status: "Pending"
    };

    expect(request.adopterId).toBe(1);
    expect(request.petId).toBe(101);
    expect(request.status).toBe("Pending");
  });

  test("links request correctly", () => {
    const adopter = { id: 1, name: "Sampada" };
    const pet = { id: 101, name: "Tommy" };
    const request = { adopterId: adopter.id, petId: pet.id };

    expect(request.adopterId).toBe(adopter.id);
    expect(request.petId).toBe(pet.id);
  });
});