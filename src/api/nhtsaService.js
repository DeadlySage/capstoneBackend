require("dotenv").config();
const axios = require("axios");
const API_URL = process.env.NHTSA_API_URL_2;

// returns the vehicleId for use with NHTSA API, if there are multiple IDs, it returns the first one, returns null if search has no result
const getVehicleId = async (make, model, modelyear) => {
  try {
    const response = await axios.get(
      `${API_URL}/SafetyRatings/modelyear/${modelyear}/make/${make}/model/${model}`
    );
    if (response.data.Count == 0) {
      return null;
    } else {
      return response.data.Results[0].VehicleId;
    }
  } catch (error) {
    console.error(error);
  }
};

// check if a vehicle has an active recall, returns number of recalls & information about each recall ** needs work
// const getRecallInfo = async (make, model, modelyear) => {
//   try {
//     const response = await axios.get(`${API_URL}/recalls/recallsByVehicle`, {
//       params: {
//         make: make,
//         model: model,
//         modelYear: modelyear,
//       },
//     });
//     if (response.data.Results.length == 0) {
//       return null;
//     } else {
//       return response.data;
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// get safety rating of a given car ** needs work
// const getSafetyRating = async (vehicleId) => {
//   try {
//     const response = await axios.get(
//       `${API_URL}/SafetyRatings/VehicleId/${vehicleId}`
//     );
//     const ratings = {
//       frontCrashRating: response.data.Results[0].FrontCrashDriversideRating,
//       sideCrashRating: response.data.Results[0].SideCrashDriversideRating,
//       rolloverRating: response.data.Results[0].RolloverRating,
//     };
//     console.log("count: ",response.data.Count)
//     if (response.data.Count == 0) {
//       console.log("null")
//       return null;
//     } else {
//       return ratings;
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// returns a link to a png of the car, returns null if no img exist
const getVehicleImg = async (vehicleId) => {
  try {
    const response = await axios.get(
      `${API_URL}/SafetyRatings/VehicleId/${vehicleId}`
    );
    if (response.data.Count == 0) {
      return null;
    } else {
      return response.data.Results[0].VehiclePicture;
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getVehicleId,
  //getRecallInfo,
  //getSafetyRating,
  getVehicleImg,
};
