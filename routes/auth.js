const express = require("express");
const router = express.Router();

const { signup, login, logout, verifyEmail } = require("../controllers/auth");
const { authUser } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/verify-email", verifyEmail);

module.exports = router;
