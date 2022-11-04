require("express-async-errors");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const jobRouter = require("./routes/job");

const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const connectDB = require("./db/connect");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 50,
  })
);

app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);

app.use(errorHandler);
app.use(notFound);

connectDB(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("Connected to DB!");
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
  });
});
