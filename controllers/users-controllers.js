const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Fetching users failed.", 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check your data.", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = new User({
    name,
    email,
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    hashedPassword: hashedPassword,
    institution: "none",
    tier: "free",
    friends: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again later.");
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  const correctPassword = await bcrypt.compare(password, existingUser.password);
  if (!correctPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  res.json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

const changePicture = async (req, res, next) => {
  const { pictureUrl } = req.body;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not change picture.",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find specified user, could not change picture.",
      500
    );
    return next(error);
  }

  user.image = pictureUrl;
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not change picture.",
      500
    );
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

exports.changePicture = changePicture;
exports.addFriend = addFriend;
exports.removeFriend = removeFriend;
exports.changeTier = changeTier;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
