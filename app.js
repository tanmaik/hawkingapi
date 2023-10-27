const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const cors = require("cors");

require("dotenv").config();

const usersRoutes = require("./routes/users-routes");
const summaryRoutes = require("./routes/summary-routes");

const app = express();

const corsOptions = {
  exposedHeaders: ["ACCESS_TOKEN"],
};

app.use(cors(corsOptions));

app.use(function (req, res, next) {
  console.log(JSON.stringify(req.headers));

  var authToken = req.get("ACCESS_TOKEN");
  console.log("Hi" + authToken);
  if (authToken === process.env.ACCESS_TOKEN) {
    next();
  }
  res.status(401).send("Unauthorized Request");
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GEsT, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/summary", summaryRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Server is connected and running on port ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
