const router = require("express").Router();
// const PORT = 3000;
// app.use(express.json());
const { createUser, userLogIn } = require("./auth");

router.post("/register", createUser);
router.post("/login", userLogIn);
// app.post("/api/auth/register", async (req, res, next) => {
//   try {
//     await createUser(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// });
// app.post("/api/auth/login", async (req, res, next) => {
//   try {
//     await userLogIn(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
