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

const getUser = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    const error = new HttpError("Fetching user failed.", 500);
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check your data.", 422));
  }
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
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
    first: " ",
    last: " ",
    email,
    hashedPassword,
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    summaries: [],
    goals: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
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

  const correctPassword = await bcrypt.compare(
    password,
    existingUser.hashedPassword
  );
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

const changeAvatar = async (req, res, next) => {
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

  user.avatar = pictureUrl;
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

const changeGoals = async (req, res, next) => {
  const { goals } = req.body;
  const userId = req.params.uid;
  //   console.log(userId);
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log("error other");
    const error = new HttpError(
      "Something went wrong, could not change goals.",
      500
    );
    return next(error);
  }
  if (!user) {
    console.log("user not found");
    const error = new HttpError(
      "Could not find specified user, could not change goals.",
      500
    );
    return next(error);
  }

  user.goals = goals;
  console.log(goals);
  try {
    await user.save();
  } catch (err) {
    console.log("couldn't save goals");
    const error = new HttpError(
      "Something went wrong, could not change goals.",
      500
    );
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const addSummary = async (req, res, next) => {
  const { summary } = req.body;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not add summary.",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find specified user, could not add summary.",
      500
    );
    return next(error);
  }

  user.summaries.push(summary);
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not add summary.",
      500
    );
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const addName = async (req, res, next) => {
  const { first, last } = req.body;
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update name.",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find specified user, could not update name.",
      500
    );
    return next(error);
  }

  user.first = first;
  user.last = last;
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update name.",
      500
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const getSummaries = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not get summaries.",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Could not find specified user, could not get summaries.",
      500
    );
    return next(error);
  }

  res.json({ summaries: user.summaries });
};

exports.getSummaries = getSummaries;
exports.addName = addName;
exports.changeGoals = changeGoals;
exports.addSummary = addSummary;
exports.changeAvatar = changeAvatar;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUser = getUser;
