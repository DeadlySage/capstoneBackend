const { decodeVin, isValidVin } = require('../src/api/vinDecoder')

describe("vin decoder", () => {
  test("should return a car information from NHTSA API", async () => {
  const response = await decodeVin("5XYKTCA69DG347850");

  expect(response.make).toBe("KIA");
  expect(response.model).toBe("Sorento");
  expect(response.modelYear).toBe("2013");
  expect(response.bodyClass).toBe("Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)");
  expect(response.vehicleType).toBe("MULTIPURPOSE PASSENGER VEHICLE (MPV)");
  });

  test("should return true due to valid vin number", async () => {
    const response = await isValidVin("5XYKTCA69DG347850");

    expect(response).toBe(true);
  })

  test("should return false due to invalid vin number", async () => {
    const response = await isValidVin("1ABCDEFGHJKLMN0PQR");

    expect(response).toBe(false);
  })
})