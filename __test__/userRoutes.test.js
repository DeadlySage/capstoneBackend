const { bcrypt } = require("../src/common");
const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
let token = "";
let UUID = "";

describe("user routes", () => {
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
  });

  it("login to user account to grab UUID and token", async () => {
    const response = await request.post("/api/auth/login").send({
      email: "john.test@test.com",
      password: "jt_pw",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful!");
    token = response.body.token;
    UUID = response.body.id;
  });

  it("get all user", async () => {
    const response = await request
      .get("/api/user/all")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("get a single user", async () => {
    const response = await request
      .get(`/api/user/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });

  it("get a single user that does not exist", async () => {
    const response = await request
      .get(`/api/user/2520ebdd-7a26-4de5-a1a6-a15bcccfb2ff`)
      .send()
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(404);
  });

  it("update test user account information", async () => {
    const response = await request
      .put(`/api/user/update/${UUID}`)
      .send({
        firstname: "jake",
        lastname: "test",
        email: "jake.test@test.com",
        password: "jt_pw",
      })
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(UUID);
    expect(response.body.firstname).toBe("jake");
    expect(response.body.lastname).toBe("test");
    expect(response.body.email).toBe("jake.test@test.com");
  });

  it("delete test user account", async () => {
    const response = await request
      .delete(`/api/user/delete/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toBe(204);
  });
});
