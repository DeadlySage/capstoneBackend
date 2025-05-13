const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

// set the timeout of each test run
jest.setTimeout(12000);

describe("service log Routes", () => {
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
  const testVin = "3VWDX7AJ5BM006256";

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

  test("user should be able to enter a service log on a car, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.mileage).toBe(80000);
    expect(response.body.data.serviceBy).toBe(userId);
    expect(response.body.data.serviceType).toBe("oil change");
    expect(response.body.data.serviceCost).toBe(80);
    expect(response.body.data.serviceDetail).toBe("changed oil");
    expect(response.body.data.serviceNote).toBe(
      "oil filter needs to be changed"
    );
  });

  test("user should be able to enter a service log on a car with only the required fields filled, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceType: "oil change",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.mileage).toBe(80000);
    expect(response.body.data.serviceType).toBe("oil change");
  });

  test("user tries to create a service log without providing a vin, should fail and returns status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const invalidTestVin = undefined;
    const response = await request
      .post(`/api/servicelog/create/car/${invalidTestVin}`)
      .send({
        mileage: "80000",
        serviceType: "oil change",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing parameters: VIN");
  });

  test("user tries to create a service log with a vin that does not exist, should fail and return status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post(`/api/servicelog/create/car/KNDPB3A23B7135414`)
      .send({
        mileage: "80000",
        serviceType: "oil change",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("car being referenced does not exist");
  });

  test("when user tries to create a service log with missing required field: mileage, should fail and return status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        serviceType: "oil change",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing required field: mileage");
  });

  test("when user tries to create a service log with missing required field: serviceType, should fail and return status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing required field: serviceType");
  });

  test("user should be able to get all the service log of a car in descending order, should be succesfull and return status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "81000",
        serviceBy: userId,
        serviceType: "tire change",
        serviceCost: "1500",
        serviceDetail: "changed all four tires",
      })
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .get(`/api/servicelog/getAll/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("when user tries to get all the service log of a car without providing a vin, should fail return status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    const invalidTestVin = undefined;

    const response = await request
      .get(`/api/servicelog/getAll/car/${invalidTestVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing parameters: VIN");
  });

  test("user should be able to get a service log by searching servicelog id, should be succesfull return status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "81000",
        serviceBy: userId,
        serviceType: "tire change",
        serviceCost: "1500",
        serviceDetail: "changed all four tires",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = serviceLogData.body.data.id;

    const response = await request
      .get(`/api/servicelog/getServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.mileage).toBe(81000);
    expect(response.body.data.serviceBy).toBe(userId);
    expect(response.body.data.serviceType).toBe("tire change");
    expect(response.body.data.serviceCost).toBe(1500);
    expect(response.body.data.serviceDetail).toBe("changed all four tires");
  });

  test("when user tries to get a service log but did not put in a service log id, should fail return status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = undefined;

    const response = await request
      .get(`/api/servicelog/getServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing parameters: id");
  });

  test("when user tries to get a service log but that service log does not exist, should fail return status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    const serviceLogId = "23f4bf38-a4c0-4cb4-a362-f18f1899f58a";

    const response = await request
      .get(`/api/servicelog/getServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("that service log entry does not exist");
  });

  test("user should be able to edit a service log, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = serviceLogData.body.data.id;

    const response = await request
      .put(`/api/servicelog/updateServiceLog/${serviceLogId}`)
      .send({
        performedAt: "2025-05-13T12:00:00.000Z",
        mileage: "83000",
        serviceBy: null,
        serviceType: "replace wheel",
        serviceCost: "1500",
        serviceDetail: "replaced all 4 wheels with winter tires",
        serviceNote: "back left wheel rim is slightly damaged, its recomended to replace it with a new one",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.serviceBy).toBe(null);
  });

  test("when user tries to update a service log but does not provide the service log id, should fail returns status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = undefined;

    const response = await request
      .put(`/api/servicelog/updateServiceLog/${serviceLogId}`)
      .send({
        serviceBy: null,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing parameters: id");
  });

  test("if user tries to update a service log but does not provide any JSON, should fail returns status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = serviceLogData.body.data.id;

    const response = await request
      .put(`/api/servicelog/updateServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing JSON");
  });

  test("if user tries to update a service log that does not exist, should fail returns status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    const serviceLogId = "23f4bf38-a4c0-4cb4-a362-f18f1899f58a"

    const response = await request
      .put(`/api/servicelog/updateServiceLog/${serviceLogId}`)
      .send({
        serviceBy: null,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("that service log entry does not exist");
  });

  test("user should be able to delete a service log, should be succesfull returns status 204", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = serviceLogData.body.data.id;

    const response = await request
      .delete(`/api/servicelog/deleteServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  test("user tries to delete a service log without providing service log id, should fail returns status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = undefined;

    const response = await request
      .delete(`/api/servicelog/deleteServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing parameters: id");
  });

  test("user tries to delete a service log that does not exist, should fail returns status code 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;
    const userId = userData.body.user.id;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a service log entry
    const serviceLogData = await request
      .post(`/api/servicelog/create/car/${testVin}`)
      .send({
        mileage: "80000",
        serviceBy: userId,
        serviceType: "oil change",
        serviceCost: "80",
        serviceDetail: "changed oil",
        serviceNote: "oil filter needs to be changed",
      })
      .set("Authorization", `Bearer ${token}`);

    const serviceLogId = "866b1084-aecd-4adf-acd4-821a318166d1";

    const response = await request
      .delete(`/api/servicelog/deleteServiceLog/${serviceLogId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("that service log entry does not exist");
  });
});
