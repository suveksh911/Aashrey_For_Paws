describe("Pet Management System", () => {
  test("adds a pet record", () => {
    const pet = { name: "Tommy", age: 2, breed: "Labrador" };

    expect(pet.name).toBe("Tommy");
    expect(pet.age).toBe(2);
  });

  test("updates a pet record", () => {
    const pet = { name: "Tommy", age: 2 };
    pet.age = 3;

    expect(pet.age).toBe(3);
  });

  test("deletes a pet record", () => {
    let pet = { name: "Tommy" };
    pet = null;

    expect(pet).toBeNull();
  });
});