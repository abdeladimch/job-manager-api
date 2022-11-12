const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
require("dotenv").config();
const { attachTokenToCookies } = require("../utils/index");

const authUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  if (!accessToken && !refreshToken) {
    throw new CustomError.UnauthenticatedError("Authentication failed!");
  }
  if (accessToken) {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const existingToken = await Token.findOne({
    user: decoded.userToken.userId,
    refreshToken: decoded.refreshToken,
  });

  attachTokenToCookies(res, decoded.userToken, existingToken.refreshToken);
  req.user = decoded.userToken;
  next();
};

const authPerms = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this resource!"
      );
    }
    next();
  };
};

module.exports = { authUser, authPerms };
