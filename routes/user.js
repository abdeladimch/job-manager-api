const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showMe,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/user");
const { showMyJobs } = require("../controllers/job");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router.route("/").get(authUser, authPerms("admin"), getAllUsers);
router.route("/showMe").get(authUser, showMe);
router.route("/showMyJobs").get(authUser, showMyJobs);
router.route("/:id").get(authUser, getSingleUser);

router.route("/updateUser").patch(authUser, updateUser);
router.route("/updateUserPassword").patch(authUser, updateUserPassword);
router.route("/:id").delete(authUser, deleteUser);

module.exports = router;
