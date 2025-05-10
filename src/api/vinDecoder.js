require("dotenv").config();
const axios = require("axios");
const xml2js = require("xml2js");
const API_URL = process.env.NHTSA_API_URL;

// vin decoder 
const decodeVin = async (vin) => {
  try {
    // calls the NHTSA API
    const response = await axios.get(
      `${API_URL}/api/vehicles/decodevinvalues/${vin}`
    );

    // converts XML to JSON
    const result = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
    });

    // construct an object containing relevant data
    const vinData = {
      make: result.Response.Results.DecodedVINValues.Make,
      model: result.Response.Results.DecodedVINValues.Model,
      modelYear: result.Response.Results.DecodedVINValues.ModelYear,
      bodyClass: result.Response.Results.DecodedVINValues.BodyClass,
      vehicleType: result.Response.Results.DecodedVINValues.VehicleType,
    };
    return vinData;
  } catch (error) {
    console.error(error);
  }
};

// check if user entered a valid vin
const isValidVin = async (vin) => {
  // cals the NHTSA API
  const response = await axios.get(
    `${API_URL}/api/vehicles/decodevinvalues/${vin}`
  );

  // convert xml to json
  const result = await xml2js.parseStringPromise(response.data, {
    explicitArray: false,
  });

  // if NHTSA API returns any error code other than 0 it means user entered an invalid vin number
  const errorCode = result.Response.Results.DecodedVINValues.ErrorCode;
  if (errorCode == 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  decodeVin,
  isValidVin,
};
