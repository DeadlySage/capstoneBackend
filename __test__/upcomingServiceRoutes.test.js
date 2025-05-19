const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

// set the timeout of each test run
jest.setTimeout(10000);

describe("upcoming service Routes", () => {
  // unique test account credentials
  const firstName = "john";
  const lastName = "test";
  const email =
    "john.test@" +
    require("path")
      .basename(expect.getState().testPath)
      .replace(".test.js", ".com");
  const password = "jt_pw";

  // unique car vin
  const testVin = "1C4BJWFGXDL531773";

  // service interval defaults
  let serviceIntervaldefaults;

  beforeAll(async () => {
    serviceIntervaldefaults = await prisma.serviceIntervalRule.findMany();
  });

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

  test("user tries to get all upcoming services that are ACTIVE or SNOOZED, should be succesfull return 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car to 5000, which triggers the creation of upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // fetch upcomingService table and check the creation of new upcoming service entries
    const checkUpcomingService = await request
      .get(`/api/upcomingService/getAllUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkUpcomingService.status).toBe(200);
    expect(checkUpcomingService.body.data.length).toBe(8);
  });

  test("user tries to get all upcoming services without proving a vin, should fail return 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car to 5000, which triggers the creation of upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // fetch upcomingService table and check the creation of new upcoming service entries
    const checkUpcomingService = await request
      .get(`/api/upcomingService/getAllUpcoming/car/1`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkUpcomingService.status).toBe(400);
    expect(checkUpcomingService.body.message).toBe(
      "missing valid parameters: VIN"
    );
  });

  test("user tries to get all upcoming services that are due, should be succesfull return 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car to 5000, which triggers the creation of upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of car to trigger 2 of the 3 upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "15000",
      })
      .set("Authorization", `Bearer ${token}`);

    const checkDueUpcomingService = await request
      .get(`/api/upcomingService/getAllDueUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkDueUpcomingService.status).toBe(200);
    expect(checkDueUpcomingService.body.data.length).toBe(2);
  });

  test("user tries to get all upcoming services that are due without providing a vin, should fail return 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car to 5000, which triggers the creation of upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    const checkDueUpcomingService = await request
      .get(`/api/upcomingService/getAllDueUpcoming/car/1`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkDueUpcomingService.status).toBe(400);
    expect(checkDueUpcomingService.body.message).toBe(
      "missing valid parameters: VIN"
    );
  });

  test("user tries to get all upcoming services that are COMPLETE, should ne succesfull return 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car to 5000, which triggers the creation of upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of car to trigger 1 of the 3 upcoming service entries
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "10000",
      })
      .set("Authorization", `Bearer ${token}`);

    // user creates service logs that the due upcoming service entries
    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "10100",
        serviceBy: userId,
        serviceType: serviceIntervaldefaults[0].serviceType,
        serviceCost: "80",
        serviceDetail: "changed engine oil and filter",
        serviceNote: "front tires need to be rotated",
      })
      .set("Authorization", `Bearer ${token}`);

    const checkCompletedUpcomingService = await request
      .get(`/api/upcomingService/getAllCompletedUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkCompletedUpcomingService.status).toBe(200);
    expect(checkCompletedUpcomingService.body.data.length).toBe(1);
  });

  test("user tries to get all upcoming services that are COMPLETE without providing a vin, should fail return 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const checkCompletedUpcomingService = await request
      .get(`/api/upcomingService/getAllCompletedUpcoming/car/1`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkCompletedUpcomingService.status).toBe(400);
    expect(checkCompletedUpcomingService.body.message).toBe(
      "missing valid parameters: VIN"
    );
  });
});
