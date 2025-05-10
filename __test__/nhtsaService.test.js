const {
  getVehicleId,
  getVehicleImg,
  getRecallInfo,
  getSafetyRating,
} = require("../src/api/nhtsaService");
const { response } = require("../src/server");
let vehicleId = "";
describe("NHTSA Service calls", () => {
  test("get the vehicleId from the make, model and year", async () => {
    const response = await getVehicleId("FIAT", "500X", 2023);

    expect(response).toBe(19369);
  });

  test("get the vehicleId from an invalid make, model and year should fail", async () => {
    const response = await getVehicleId("FIAT", "500X", 2050);

    expect(response).toBe(null);
  });

  test("get the vehicleId from the make, model and year", async () => {
    const response = await getVehicleId("JEEP", "GRAND CHEROKEE", 2013);

    vehicleId = response;
    expect(response).toBe(7234);
  });

  test("get the link to the img of the car from the vehicleId", async () => {
    const response = await getVehicleImg(vehicleId);

    expect(response).toBe(
      "https://static.nhtsa.gov/images/vehicles/8584_st0640_046.png"
    );
  });

  // test("get recall info from make, model and year", async () => {
  //   const response = await getRecallInfo("acura", "rdx", "2012");

  //   expect(response.Count).toBe(2);
  //   expect(response.results[0].NHTSACampaignNumber).toBe("19V182000");
  // });

  // test("get a car's safety rating from vehicleId", async () => {
  //   const response = await getSafetyRating(5807);

  //   expect(response.frontCrashRating).toBe("4");
  //   expect(response.sideCrashRating).toBe("5");
  //   expect(response.rolloverRating).toBe("4");
  // });

  // test("get a car's safety rating from invalid vehicleId", async () => {
  //   const response = await getSafetyRating(58073123);
  //   expect(response).toBe(null);
  // });
});
