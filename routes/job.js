const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
} = require("../controllers/job");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router
  .route("/")
  .get(authUser, authPerms("admin"), getAllJobs)
  .post(authUser, createJob);

router
  .route("/:id")
  .get(authUser, getSingleJob)
  .patch(authUser, updateJob)
  .delete(authUser, deleteJob);

module.exports = router;
