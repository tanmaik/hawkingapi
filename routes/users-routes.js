const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

router.post("/addName", usersController.addName);
router.patch("/changeGoals", usersController.changeGoals);
router.patch("/changeAvatar", usersController.changeAvatar);
router.post("/addSummary", usersController.addSummary);


router.get("/getSummaries", usersController.getSummaries);

module.exports = router;
