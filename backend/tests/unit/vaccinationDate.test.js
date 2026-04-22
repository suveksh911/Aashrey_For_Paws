function nextVaccinationDate(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 6);
  return d.getMonth();
}

describe("Vaccination Date Calculation", () => {
  test("should calculate next date", () => {
    expect(nextVaccinationDate("2026-01-01")).toBe(6);
  });
});