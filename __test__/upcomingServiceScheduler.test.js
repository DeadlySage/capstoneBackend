const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

// set the timeout of each test run
jest.setTimeout(15000);

describe("upcoming Service Scheduler function tests", () => {
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
  const testVin = "2C4GM68475R667819";

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

  test("check if server is running", async () => {
    const response = await request.get(`/`);

    expect(response.body.message).toBe("Server is running");
  });

  test("user should be able to update a car's mielage which triggers a function to create any require upcommingServices, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const UUID = userData.body.user.id;

    // create a car
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // grab all upcoming services for this car
    const response = await request
      .get(`/api/upcomingService/getAllUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(3);
    expect(response.body.data[0].carVin).toBe(testVin);
    expect(response.body.data[0].serviceType).toBe(
      serviceIntervaldefaults[0].serviceType
    );
    expect(response.body.data[0].targetMileage).toBe(
      parseInt(serviceIntervaldefaults[0].defaultIntervalMiles) + 5000
    );
    expect(response.body.data[1].serviceType).toBe(
      serviceIntervaldefaults[1].serviceType
    );
    expect(response.body.data[1].targetMileage).toBe(
      parseInt(serviceIntervaldefaults[1].defaultIntervalMiles) + 5000
    );
    expect(response.body.data[2].serviceType).toBe(
      serviceIntervaldefaults[2].serviceType
    );
    expect(response.body.data[2].targetMileage).toBe(
      parseInt(serviceIntervaldefaults[2].defaultIntervalMiles) + 5000
    );
  });

  test("when a user adds a service log it should trigger a function to check if it should complete any entries in upcommingServices, should be succesfull returns status 200", async () => {
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

    // user updates mileage of the car
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "5000",
      })
      .set("Authorization", `Bearer ${token}`);

    // user updates mileage of the car again, which causes two upcoming services to be due
    await request
      .put(`/api/car/${testVin}`)
      .send({
        mileage: "15000",
      })
      .set("Authorization", `Bearer ${token}`);

    // user submits a service log
    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "15200",
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
    expect(checkCompletedUpcomingService.body.data[0].status).toBe("COMPLETE");

    const checkUpcomingService = await request
      .get(`/api/upcomingService/getAllUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkUpcomingService.status).toBe(200);
    expect(checkUpcomingService.body.data[0].status).toBe("ACTIVE");
  });

  test("when a user creates a service log that completes 2 upcoming service entries, it should re create new upcoming service entries with updated target miles, should be succesful returns status 200", async () => {
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
    expect(checkUpcomingService.body.data.length).toBe(3);

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

    // user creates service logs that complete two due upcoming service entries
    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "15200",
        serviceBy: userId,
        serviceType: serviceIntervaldefaults[0].serviceType,
        serviceCost: "80",
        serviceDetail: "changed engine oil and filter",
        serviceNote: "front tires need to be rotated",
      })
      .set("Authorization", `Bearer ${token}`);

    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "15200",
        serviceBy: userId,
        serviceType: serviceIntervaldefaults[1].serviceType,
        serviceCost: "80",
        serviceDetail: "replaced break pads",
        serviceNote: "break fluid needs to be drained",
      })
      .set("Authorization", `Bearer ${token}`);

    const checkCompletedUpcomingService = await request
      .get(`/api/upcomingService/getAllCompletedUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkCompletedUpcomingService.status).toBe(200);
    expect(checkCompletedUpcomingService.body.data.length).toBe(2);

    // once those service logs are submited it should auto complete two of those upcoming service entries
    // and re create new ones with an updated target mileage
    const checkUpcomingServiceNew = await request
      .get(`/api/upcomingService/getAllUpcoming/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(checkUpcomingServiceNew.status).toBe(200);
    expect(checkUpcomingServiceNew.body.data.length).toBe(3);
  });
});
