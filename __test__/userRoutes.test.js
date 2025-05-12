const { bcrypt } = require("../src/common");
const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

describe("user routes", () => {
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

  test("test get all user route, should be succesfull returns status 200", async () => {
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
      .get("/api/user/all")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("get all user without a valid token, should be a failure returns status 401", async () => {
    const token = "";

    const response = await request
      .get("/api/user/all")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  test("get a single user, should be succesfull returns status 200", async () => {
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
    const UUID = userData.body.user.id;

    const response = await request
      .get(`/api/user/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("get a single user that does not exist, should fail returns status 404", async () => {
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
      .get(`/api/user/2520ebdd-7a26-4de5-a1a6-a15bcccfb2ff`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test("update test user account information, should be succesfull returns status 200", async () => {
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
    const UUID = userData.body.user.id;

    const response = await request
      .put(`/api/user/update/${UUID}`)
      .send({
        firstname: firstName,
        lastname: "updatedTest",
        email: email,
        password: password,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe("john");
    expect(response.body.lastname).toBe("updatedTest");
    expect(response.body.email).toBe(email);
  });
});
