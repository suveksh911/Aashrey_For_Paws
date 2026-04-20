const jwt = require("jsonwebtoken");

const SECRET = "testsecret";

describe("JWT Authentication", () => {
  test("creates and verifies a token", () => {
    const payload = { id: 1, role: "Adopter" };

    const token = jwt.sign(payload, SECRET);
    const decoded = jwt.verify(token, SECRET);

    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe("Adopter");
  });

  test("rejects invalid token", () => {
    expect(() => jwt.verify("invalidtoken", SECRET)).toThrow();
  });
});