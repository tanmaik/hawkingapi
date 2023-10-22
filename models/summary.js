const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  answerText: { type: String, required: true },
});

const summarySchema = new Schema({
  icon: { type: String, required: false },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  easySummary: { type: String, required: true },
  flashcards: [questionSchema],
  questions: [questionSchema],
});

module.exports = mongoose.model("Summary", summarySchema);

// const newSummary = new Summary({
//     icon: "some-icon",
//     title: "Summary Title",
//     questions: [
//       { questionText: "Question 1", answerText: "Answer 1" },
//       { questionText: "Question 2", answerText: "Answer 2" },
//     ],
//   });

//   newSummary.save((err, summary) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log("Summary saved:", summary);
//     }
//   });
