const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

const genJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const attachTokenToCookies = (res, userToken, refreshToken) => {
  const accessTokenJWT = genJWT(userToken);
  const refreshTokenJWT = genJWT({ userToken, refreshToken });
  const oneDay = 1000 * 3600 * 24;
  res.cookie("accessToken", accessTokenJWT, {
    maxAge: 1000 * 60 * 15,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    expires: new Date(Date.now() + oneDay),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { createToken, attachTokenToCookies };
