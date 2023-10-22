const OpenAI = require("openai");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fs = require("fs");

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

  image_prompt = await getImagePrompt(text);
  // console.log("Here is one word to describe the article...",image_prompt);

  image_url = await getImage(image_prompt);
  // console.log("Use this url to find an icon that describes the article...",image_url)
};

fs.readFile("data.txt", "utf8", function (err, data) {
  text = data.replace("\n", "");
  // Display the file content
  n = 250;
  summary_size = parseInt(text.length / n);
  console.log(text, n);
  getAllGeneration(text, summary_size);
});
