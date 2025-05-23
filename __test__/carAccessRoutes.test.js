const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");
jest.setTimeout(15000);

describe("carAccess routes", () => {
  // unique test account credentials - user 1
  const firstName1 = "john";
  const lastName1 = "test";
  const email1 =
    "john.test@" +
    require("path")
      .basename(expect.getState().testPath)
      .replace(".test.js", ".com");
  const password1 = "jt_pw";

  // unique test account credentials - user 2
  const firstName2 = "adam";
  const lastName2 = "test";
  const email2 =
    "adam.test@" +
    require("path")
      .basename(expect.getState().testPath)
      .replace(".test.js", ".com");
  const password2 = "jt_pw";

  // test car 1
  const carVin1 = "2S3DA417576128786";

  // test car 2
  const carVin2 = "1G1ZT51816F264066";

  // create test account before each test
  beforeEach(async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName1,
      lastname: lastName1,
      email: email1,
      password: password1,
    });

    await request.post("/api/auth/register").send({
      firstname: firstName2,
      lastname: lastName2,
      email: email2,
      password: password2,
    });
  });

  // clean up database from test account after each test
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [email1, email2],
        },
      },
    });
  });

  test("user1 gives user2 permission to their car, should be succesfull returns 200", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their car
    const response = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(200);
  });

  test("user1 tries to give permisions to a car they do not own, should fail return 403", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 2
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token2}`);

    // user 1 gives user 2 permissions to a car they do not own
    const response = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(403);
  });

  test("user1 tries to give an non existant user permision to their car, should fail return 404", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives non-existant user permissions to their car
    const response = await request
      .post(
        `/api/carAccess/givePerms/car/${carVin1}/user/517de7df-3b5e-4ae2-a84c-f4fc3fa3c359`
      )
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(404);
  });

  test("check if user has permisions for a given vin, should be succesfull return status 200", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their car
    const giveperms = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .get(`/api/carAccess/checkPerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User has permission");
  });

  test("check if user has permisions for a given vin, should fail returns tatus 403", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .get(`/api/carAccess/checkPerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("user do not have permission");
  });

  test("user tries to fetch a list of all permisions for a car, should be succesfull return status 200", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their car
    const giveperms = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .get(`/api/carAccess/getAllPerms/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "succesfully fetched all permission rules attached this vin"
    );
    expect(response.body.data.length).toBe(1);
  });

  test("user tries to delete a permision rule for a car, should be succesfull return status 204", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their car
    const giveperms = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .delete(`/api/carAccess/deletePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(204);
  });

  test("user tries to delete a permision rule for a car that does not exist, should be fail return status 404", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .delete(`/api/carAccess/deletePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(404);
  });

  test("user tries to delete a permisision rule for a car that they do not own, should fail return status 401", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create a car for user 1
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their car
    const giveperms = await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    const response = await request
      .delete(`/api/carAccess/deletePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(401);
  });

  test("user tries to get a list of all cars shared to them, should be succesfull return status 200", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create user 1 cars
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    await request
      .post(`/api/car/${carVin2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // user 1 gives user 2 permissions to their cars
    await request
      .post(`/api/carAccess/givePerms/car/${carVin1}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    await request
      .post(`/api/carAccess/givePerms/car/${carVin2}/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // grabs list of all cars shared to user 2
    const response = await request
      .get(`/api/carAccess/getAllSharedCars/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(2);
  });

  test("user tries to get a list of all cars shared to them, should fail return status 204", async () => {
    // login to user 1 account
    const userData1 = await request.post("/api/auth/login").send({
      email: email1,
      password: password1,
    });

    const token1 = userData1.body.token;
    const UUID1 = userData1.body.user.id;

    // login to user 2 account
    const userData2 = await request.post("/api/auth/login").send({
      email: email2,
      password: password2,
    });

    const token2 = userData2.body.token;
    const UUID2 = userData2.body.user.id;

    // create user 1 cars
    await request
      .post(`/api/car/${carVin1}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    await request
      .post(`/api/car/${carVin2}`)
      .send()
      .set("Authorization", `Bearer ${token1}`);

    // grabs list of all cars shared to user 2
    const response = await request
      .get(`/api/carAccess/getAllSharedCars/user/${UUID2}`)
      .send()
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(204);
  });
});
