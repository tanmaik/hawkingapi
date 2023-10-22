const HttpError = require("../models/http-error");
const Summary = require("../models/summary");
const User = require("../models/user");

const addSummary = async (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  const { icon, title, summary, easySummary, flashcards, questions } = req.body;

  //   const newSummary = new Summary({
  //     icon: "https://cdn-icons-png.flaticon.com/512/1216/1216895.png",
  //     title: "Placeholder Title",
  //     summary: "Placeholder Summary",
  //     easySummary: "Placeholder Easy Summary",
  //     flashcards: [
  //       {
  //         questionText: "Placeholder Question",
  //         answerText: "Placeholder Answer",
  //       },
  //     ],
  //     questions: [
  //       {
  //         questionText: "Placeholder Question",
  //         answerText: "Placeholder Answer",
  //       },
  //     ],
  //   });

  const newSummary = new Summary({
    icon,
    title,
    summary,
    easySummary,
    flashcards,
    questions,
  });

  try {
    await newSummary.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating summary failed, please try again later.",
      500
    );
    return next(error);
  }

  // add summary id to user id's summaries

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not add summary.",
      500
    );
    console.log(err);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find specified user, could not add summary.",
      500
    );
    return next(error);
  }
  //add new summary's id to user's summaries
  user.summaries.push(newSummary.id);

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not add summary.",
      500
    );
    return next(error);
  }

  res.status(201).json({ summary: newSummary.toObject({ getters: true }) });
};

const getSummary = async (req, res, next) => {
  const summaryId = req.params.sid;
  //   console.log(summaryId);
  let summary;
  try {
    summary = await Summary.findById(summaryId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find summary.",
      500
    );
    return next(error);
  }
  if (!summary) {
    const error = new HttpError("Could not find specified summary.", 500);
    return next(error);
  }
  res.json({ summary: summary.toObject({ getters: true }) });
};

exports.getSummary = getSummary;
exports.addSummary = addSummary;
