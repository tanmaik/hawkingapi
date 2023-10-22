const express = require("express");
const summariesController = require("../controllers/summaries-controllers");
const OpenAI = require("openai");
const Summary = require("../models/summary");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const router = express.Router();
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get("/:sid", summariesController.getSummary);
router.post("/:uid", summariesController.addSummary);
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const tesseract = require("node-tesseract-ocr");

// in hawkin's words...
const getSummary = async (text, summary_size) => {
  const prompt = `Concise ${summary_size}-sentence summary of the following: ${text}`;
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });
  return response.choices[0].message.content;
};

// in simple terms...
const getSimpleSummary = async (text, summary_size) => {
  const prompt = `Use analogies to write a ${summary_size}-sentence summary of the following: ${text}`;
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });
  return response.choices[0].message.content;
};

// Questions and Answers
const getQnA = async (text, summary_size) => {
  const prompt = `Create ${summary_size} questions with answers on the next line about the following: ${text}`;
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });

  response_string = response.choices[0].message.content;
  response_split = response_string.split("\n");

  var i = 0;
  while (i < response_split.length)
    if (response_split[i] === "") response_split.splice(i, 1);
    else ++i;

  for (var i = 0; i < response_split.length; i++)
    response_split[i] = response_split[i].replace(/^[^a-zA-Z]+/, "").trim();

  return response_split;
};

const getFlashcards = async (text, summary_size) => {
  const prompt = `Identify and define ${
    summary_size * 2
  } key terms separated by a colon: ${text}`;
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });

  response_string = response.choices[0].message.content;
  // console.log(response_string);
  response_split = response_string.split("\n");
  // console.log(response_split);
  for (var i = 0; i < response_split.length; i++)
    response_split[i] = response_split[i].trim();
  // console.log(response_split);

  var i = 0;
  while (i < response_split.length)
    if (response_split[i] === "") response_split.splice(i, 1);
    else ++i;

  // split terms from defs...
  terms = [];
  defs = [];
  for (var i = 0; i < response_split.length; i++) {
    const [first, ...rest] = response_split[i].split(":");
    const others = rest.join(":");
    terms.push(first.replace(/^[^a-zA-Z]+/, "").trim());
    defs.push(others.replace(/^[^a-zA-Z]+/, "").trim());
  }

  return [terms, defs];
};

function array_unzip(arr) {
  return [
    arr.filter((_, index) => index % 2 === 0),
    arr.filter((_, index) => index % 2 === 1),
  ];
}

const getImagePrompt = async (text) => {
  const prompt = `give one word based on the article: ${text}`;
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
  });

  response_string = response.choices[0].message.content;

  return response_string;
};

const getImage = async (image_prompt) => {
  const response = await openai.images.generate({
    prompt: `a circular black and white icon of ${image_prompt}`,
    n: 1,
    size: "256x256",
  });

  const url = response.data[0].url;

  return url;
};

const getAllGeneration = async (text, summary_size) => {
  summary = await getSummary(text, summary_size);
  // console.log("In Hawking's words...\n",summary);
  // console.log("\n");

  simple_summary = await getSimpleSummary(text, summary_size);
  // console.log("In simple terms...\n",simple_summary);
  // console.log("\n");

  raw_qna = await getQnA(text, summary_size);
  qna = array_unzip(raw_qna);
  // console.log("Here are some questions...\n",qna[0]);
  // console.log("Here are their answers...\n",qna[1]);
  // console.log("\n");

  flashcards = await getFlashcards(text, summary_size);
  // console.log("Here are some terms...",flashcards[0]);
  // console.log("Here are their definitions...",flashcards[1]);
  // console.log("\n");

  title = await getImagePrompt(text);
  // console.log("Here is one word to describe the article...",image_prompt);

  image_url = await getImage(title);

  return {
    summary,
    simple_summary,
    qna,
    flashcards,
    title,
    image_url,
  };
  // console.log("Use this url to find an icon that describes the article...",image_url)
};

router.patch(
  "/upload/:uid",
  upload.single("file"),
  async function (req, res, next) {
    let userId = req.params.uid;
    // req.file is the `file` file
    // req.body will hold the text fields, if there were any
    console.log(req.file); // you will see all file details in console
    let text = "";
    let summary_size = 1;
    if (
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "txt"
    ) {
      console.log("file is txt");
      let data = fs.readFileSync(req.file.path, "utf8");
      text = data.replace("\n", "");
    } else if (
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "png" ||
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "jpg" ||
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "jpeg"
    ) {
      const config = {
        lang: "eng",
        oem: 1,
        psm: 3,
      };

      var image_file_name = req.file.path;

      try {
        text = await tesseract.recognize(image_file_name, config);
        console.log(text);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      console.log("file is not supported");
    }

    summary_size = parseInt(text.length / 250);
    console.log(text);
    const generations = await getAllGeneration(text, summary_size);

    let questions = generations.qna;
    let finalQuestions = [];
    let flashcards = generations.flashcards;

    for (var i = 0; i < questions[0].length; i++) {
      finalQuestions.push({
        questionText: questions[0][i],
        answerText: questions[1][i],
      });
    }

    let finalFlashcards = [];
    for (var i = 0; i < flashcards[0].length; i++) {
      finalFlashcards.push({
        questionText: flashcards[1][i],
        answerText: flashcards[0][i],
      });
    }

    const newSummary = new Summary({
      summary: generations.summary,
      easySummary: generations.simple_summary,
      questions: finalQuestions,
      flashcards: finalFlashcards,
      title: generations.title,
      icon: generations.image_url,
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
  }
);

module.exports = router;
