const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");
jest.setTimeout(10000);

describe("car routes", () => {
  // unique test account credentials
  const firstName = "john";
  const lastName = "test";
  const email =
    "john.test@" +
    require("path")
      .basename(expect.getState().testPath)
      .replace(".test.js", ".com");
  const password = "jt_pw";

  // create test account before each test
  beforeEach(async () => {
    await request.post("/api/auth/register").send({
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    });
  });

  // clean up database from test account after each test
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: email,
      },
    });
  });

  test("user should be able to enter a vin and automatically populate the Car table fields, should be succesfull returns 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    const response = await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.vin).toBe("1C4RJFBG5DC522189");
    expect(response.body.data.make).toBe("JEEP");
    expect(response.body.data.model).toBe("Grand Cherokee");
    expect(response.body.data.modelYear).toBe(2013);
    expect(response.body.data.bodyClass).toBe(
      "Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)"
    );
    expect(response.body.data.vehicleType).toBe(
      "MULTIPURPOSE PASSENGER VEHICLE (MPV)"
    );
    expect(response.body.data.userId).toBe(UUID);
  });

  test("when user tries to add a car but enters an invalid vin, should be failure returns status 422", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    const response = await request
      .post("/api/car/1")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(422);
  });

  test("when user tries to add the same car twice, should be failure", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });

  test("user should be able to get all cars owned by them, should be succesfull retuns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    await request
      .post("/api/car/WP0CB2A92GS154286")
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .get("/api/car/all")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("user should be able to get a specific car owned by them, should be succesfull retuns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .get("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vin).toBe("1C4RJFBG5DC522189");
    expect(response.body.make).toBe("JEEP");
    expect(response.body.model).toBe("Grand Cherokee");
    expect(response.body.modelYear).toBe(2013);
    expect(response.body.bodyClass).toBe(
      "Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)"
    );
    expect(response.body.vehicleType).toBe(
      "MULTIPURPOSE PASSENGER VEHICLE (MPV)"
    );
    expect(response.body.carImg).toBe(
      "https://static.nhtsa.gov/images/vehicles/8584_st0640_046.png"
    );
    expect(response.body.userId).toBe(UUID);
  });

  test("user should be able to update a car's mileage, should be succesfull return status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .put("/api/car/1C4RJFBG5DC522189")
      .send({
        mileage: "40000",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.vin).toBe("1C4RJFBG5DC522189");
    expect(response.body.data.mileage).toBe(40000);
  });

  test("user tries to update a car's mileage with a vin that does not exist, should fail return status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    const response = await request
      .put("/api/car/1C4RJFBG5DC522189")
      .send({
        mileage: "40000",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("car not found");
  });

  test("entering a vin that does not exist, should result in a 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    const response = await request
      .get("/api/car/WP0CB2A92GS154100")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test("delete a user's car should be a success", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .delete("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});
