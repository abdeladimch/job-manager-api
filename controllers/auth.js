const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../models/User");
const jwt = require("../utils");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/Token");

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      "Name, email and password fields cannot be empty!"
    );
  }

  const emailToken = crypto.randomBytes(64).toString("hex");
  req.body.emailToken = emailToken;
  const origin = req.headers.host;
  const user = await User.create(req.body);
  await sendEmail(name, email, emailToken, origin);
  res
    .status(StatusCodes.CREATED)
    .json({ status: "Success!", msg: "Please verify your email!" });
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ emailToken: token });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Email validation failed!");
  }
  user.isVerified = true;
  user.date = Date.now();
  user.emailToken = "";
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Email verified!" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Email and password fields cannot be empty!"
    );
  }

  const user = await User.findOne({ email });
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email!");
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const token = jwt.createToken(user);

  let refreshToken = "";
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid credentials");
    }
    refreshToken = existingToken.refreshToken;
    jwt.attachTokenToCookies(res, token, refreshToken);
    return res.status(StatusCodes.OK).json({ status: "Success!", user: token });
  }

  refreshToken = crypto.randomBytes(64).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const tokenObj = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(tokenObj);
  jwt.attachTokenToCookies(res, token, refreshToken);
  res.status(StatusCodes.OK).json({ status: "Success!", user: token });
};

const logout = async (req, res) => {
  res.cookie("accessToken", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.cookie("refreshToken", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "User logged out!" });
};

module.exports = { signup, login, logout, verifyEmail };
