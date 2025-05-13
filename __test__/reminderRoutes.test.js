const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
const { prisma } = require("../src/common");

// set the timeout of each test run
jest.setTimeout(11000);

describe("reminder Routes", () => {
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
  const testVin = "4A3AB76T68E011282";

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

  test("user should be able to create a reminder for a car, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const response = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tittle).toBe(
      "oil slowly dripping bellow the car"
    );
    expect(response.body.data.notes).toBe(
      "oil is slowly dripping below the car under the engine bay"
    );
  });

  test("user tries to create a reminder for a car that does not exist, should fail returns status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a reminder for the car
    const response = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("car being referenced does not exist");
  });

  test("user should be able to get a list of all the reminders on the car, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    // create a second reminder for the car
    await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "tail lights are dim",
        notes: "water damage in right tail light",
      })
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .get(`/api/reminder/getAll/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("user should be able to get a specific reminder by searching with id", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    const response = await request
      .get(`/api/reminder/getReminder/${reminderId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reminderId);
    expect(response.body.tittle).toBe("oil slowly dripping bellow the car");
    expect(response.body.notes).toBe(
      "oil is slowly dripping below the car under the engine bay"
    );
  });

  test("user tries to get a reminder that does not exist, should fail returns status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .get(`/api/reminder/getReminder/62a988f2-a8e9-4220-8da1-f92e08a13024`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("reminder does not exist");
  });

  test("user should be able to update a specific reminder by reminderId, should be succesfull returns status 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    const response = await request
      .put(`/api/reminder/updateReminder/${reminderId}`)
      .send({
        tittle: "tail lights are dim",
        notes: "water damage in right tail light",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reminderId);
    expect(response.body.data.tittle).toBe("tail lights are dim");
    expect(response.body.data.notes).toBe("water damage in right tail light");
  });

  test("user should be able to update a reminder with only required fields, should be succesfull returns 200", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    const response = await request
      .put(`/api/reminder/updateReminder/${reminderId}`)
      .send({
        tittle: "tail lights are dim",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reminderId);
    expect(response.body.data.tittle).toBe("tail lights are dim");
    expect(response.body.data.notes).toBe(
      "oil is slowly dripping below the car under the engine bay"
    );
  });

  test("when a user tries to update a reminder without inputing any fields it should fail, return status 400", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    const response = await request
      .put(`/api/reminder/updateReminder/${reminderId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reminderId);
    expect(response.body.data.tittle).toBe(
      "oil slowly dripping bellow the car"
    );
    expect(response.body.data.notes).toBe(
      "oil is slowly dripping below the car under the engine bay"
    );
  });

  test("user should be able to delete a reminder attached to a car, should be succecsfull returns status 204", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    const response = await request
      .delete(`/api/reminder/deleteReminder/${reminderId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  test("user tries to delete a reminder that does not exist, should fail return status 404", async () => {
    const userData = await request.post("/api/auth/login").send({
      email: email,
      password: password,
    });

    const token = userData.body.token;

    // create a car for test account
    await request
      .post(`/api/car/${testVin}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    // create a reminder for the car
    const reminderData = await request
      .post(`/api/reminder/create/car/${testVin}`)
      .send({
        tittle: "oil slowly dripping bellow the car",
        notes: "oil is slowly dripping below the car under the engine bay",
      })
      .set("Authorization", `Bearer ${token}`);

    const reminderId = reminderData.body.data.id;

    await request
      .delete(`/api/reminder/deleteReminder/${reminderId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    const response = await request
      .delete(`/api/reminder/deleteReminder/${reminderId}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
