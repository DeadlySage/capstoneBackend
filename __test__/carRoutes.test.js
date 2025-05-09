const app = require("../src/server");
const supertest = require("supertest");
const request = supertest(app);
let token = "";
let UUID = "";

describe("car routes", () => {
  test("create a new test user account", async () => {
    const response = await request.post("/api/auth/register").send({
      firstname: "john",
      lastname: "test",
      email: "john.test@test.com",
      password: "jt_pw",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Registration successful!");
  });

  test("login to user account to grab UUID and token", async () => {
    const response = await request.post("/api/auth/login").send({
      email: "john.test@test.com",
      password: "jt_pw",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful!");
    token = response.body.token;
    UUID = response.body.user.id;
  });

  test("user should be able to enter a vin and automatically populate the Car table fields", async () => {
    const response = await request
      .post("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

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

  test("user should be able to enter a second car", async () => {
    const response = await request
      .post("/api/car/WP0CB2A92GS154286")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.body.data.vin).toBe("WP0CB2A92GS154286");
    expect(response.body.data.make).toBe("PORSCHE");
    expect(response.body.data.model).toBe("911");
    expect(response.body.data.modelYear).toBe(2016);
    expect(response.body.data.bodyClass).toBe("Convertible/Cabriolet");
    expect(response.body.data.vehicleType).toBe("PASSENGER CAR");
    expect(response.body.data.userId).toBe(UUID);
  });

  test("user should be able to get all cars owned by them", async () => {
    const response = await request
      .get("/api/car/all")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("user should be able to get a specific car owned by them", async () => {
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
    expect(response.body.carImg).toBe("https://static.nhtsa.gov/images/vehicles/8584_st0640_046.png")
    expect(response.body.userId).toBe(UUID);
  });

  test("user should be able to get a specific car owned by them (check a second car)", async () => {
    const response = await request
      .get("/api/car/WP0CB2A92GS154286")
      .send()
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.vin).toBe("WP0CB2A92GS154286");
    expect(response.body.make).toBe("PORSCHE");
    expect(response.body.model).toBe("911");
    expect(response.body.modelYear).toBe(2016);
    expect(response.body.bodyClass).toBe("Convertible/Cabriolet");
    expect(response.body.vehicleType).toBe("PASSENGER CAR");
    expect(response.body.carImg).toBe(null);
    expect(response.body.userId).toBe(UUID);
  });

  test("entering a vin that does not exist should result in a 404", async () => {
    const response = await request
      .get("/api/car/WP0CB2A92GS154100")
      .send()
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(404);
  });

  test("delete a user's car should be a success", async () => {
    const response = await request
      .delete("/api/car/1C4RJFBG5DC522189")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  test("delete test user account", async () => {
    const response = await request
      .delete(`/api/user/delete/${UUID}`)
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toBe(204);
  });
});
