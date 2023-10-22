const express = require("express");
const summariesController = require("../controllers/summaries-controllers");

const router = express.Router();
const fs = require("fs");

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

router.patch("/upload", upload.single("file"), function (req, res, next) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any
  console.log(req.file); // you will see all file details in console

  if (
    req.file.originalname.split(".")[
      req.file.originalname.split(".").length - 1
    ] === "txt"
  ) {
    console.log("file is txt");
    fs.readFile(req.file.path, "utf8", function (err, data) {
      text = data.replace("\n", "");
      // Display the file content
      n = 250;
      summary_size = parseInt(text.length / n);
      console.log("hello");
      console.log(text, n);
    });
  } else if (
    req.file.originalname.split(".")[
      req.file.originalname.split(".").length - 1
    ] === "png"
  ) {
  } else if (
    req.file.originalname.split(".")[
      req.file.originalname.split(".").length - 1
    ] === "jpg"
  ) {
  } else {
    return res.send("file not supported");
  }
  res.send("file uploaded successfully");
});

module.exports = router;
