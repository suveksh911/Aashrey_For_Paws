describe("Search and Filter System", () => {
  const pets = [
    { name: "Tommy", type: "Dog", age: 2 },
    { name: "Mimi", type: "Cat", age: 1 },
    { name: "Rocky", type: "Dog", age: 4 }
  ];

  test("searches pets by keyword", () => {
    const result = pets.filter(pet => pet.name === "Tommy");
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Tommy");
  });

  test("filters pets by type", () => {
    const result = pets.filter(pet => pet.type === "Dog");
    expect(result.length).toBe(2);
  });
});
