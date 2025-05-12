const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

describe("auth routes", () => {
  // unique test account credentials
  const firstName = "john";
  const lastName = "test";
  const email =
    "john.test@" +
    require("path")
      .basename(expect.getState().testPath)
      .replace(".test.js", ".com");
  const password = "jt_pw";

  // clean up database from test account after each test
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: email,
      },
    });
  });

  it("create a new test user account", async () => {
    const response = await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Registration successful!");
  });

  it("checks to see if duplicate account fails registration", async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    const response = await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User with this email already exists.");
  });

  it("check if login works", async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    const response = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful!");
  });

  it("get info about current user", async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    const response = await request
      .get("/api/auth/me")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("john.test@authRoutes.com");
    expect(response.body.user.firstname).toBe("john");
    expect(response.body.user.lastname).toBe("test");
  });

  it("delete test user account", async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });

    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const UUID = userData.body.user.id;
    const token = userData.body.token;

    const response = await request
      .delete(`/api/user/delete/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toBe(204);
  });
});
