const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
let token = "";
let UUID = "";

describe("auth routes", () => {
  it("checks if server is running", async () => {
    const response = await request.get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Server is running");
  });

  it("create a new test user account", async () => {
    const response = await request.post("/api/auth/register").send({
      firstname: "john",
      lastname: "test",
      email: "john.test@test.com",
      password: "jt_pw",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Registration successful!");
  }),
    it("checks to see if duplicate account fails registration", async () => {
      const response = await request.post("/api/auth/register").send({
        firstname: "john",
        lastname: "test",
        email: "john.test@test.com",
        password: "jt_pw",
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        "User with this email already exists."
      );
    }),
    it("check if login works", async () => {
      const response = await request.post("/api/auth/login").send({
        email: "john.test@test.com",
        password: "jt_pw",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful!");
      token = response.body.token;
      UUID = response.body.id;
    });

  it("get info about current user", async () => {
    const response = await request
      .get("/api/auth/me")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("john.test@test.com");
    expect(response.body.user.firstname).toBe("john");
    expect(response.body.user.lastname).toBe("test");
  });

  it("delete test user account", async () => {
    const response = await request
      .delete(`/api/user/delete/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toBe(204);
  });
});
