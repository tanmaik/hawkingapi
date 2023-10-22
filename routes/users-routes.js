const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersController.getUsers);
router.get("/getUser/:uid", usersController.getUser);

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

router.post("/addName/:uid", usersController.addName);
router.patch("/changeGoals/:uid", usersController.changeGoals);
router.patch("/changeAvatar/:uid", usersController.changeAvatar);
router.post("/addSummary/:uid", usersController.addSummary);

router.get("/getSummaries/:uid", usersController.getSummaries);

module.exports = router;
