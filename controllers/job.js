const Job = require("../models/Job");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPerms = require("../utils/checkPerms");

const createJob = async (req, res) => {
  const { company, position } = req.body;

  if (!company || !position) {
    throw new CustomError.BadRequestError(
      "Company and position fields cannot be empty!"
    );
  }

  req.body.user = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json(job);
};

const getAllJobs = async (req, res) => {
  const jobs = await Job.find().populate({ path: "user", select: "_id name" });

  if (!jobs.length) {
    throw new CustomError.NotFoundError("No jobs found");
  }
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getSingleJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id });
  if (!job) {
    throw new CustomError.NotFoundError(
      `Coudn't find job with id ${req.params.id}`
    );
  }

  checkPerms(req.user, job.user);
  res.status(StatusCodes.OK).json(job);
};

const showMyJobs = async (req, res) => {
  const myJobs = await Job.find({ user: req.user.userId });

  if (myJobs.length < 1) {
    throw new CustomError.NotFoundError("You haven't created any jobs yet!");
  }

  res.status(StatusCodes.OK).json({ myJobs, count: myJobs.length });
};

const updateJob = async (req, res) => {
  const { company, position, status } = req.body;

  if (!company || !position) {
    throw new CustomError.BadRequestError(
      "Company and position fields cannot be empty!"
    );
  }

  const job = await Job.findOne({ _id: req.params.id });
  if (!job) {
    throw new CustomError.NotFoundError(
      `Coudn't find job with id ${req.params.id}`
    );
  }

  checkPerms(req.user, job.user);
  job.company = company;
  job.position = position;
  job.status = status;
  await job.save();
  res.status(StatusCodes.OK).json(job);
};

const deleteJob = async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id });

  if (!job) {
    throw new CustomError.NotFoundError(
      `Coudn't find job with id ${req.params.id} !`
    );
  }

  checkPerms(req.user, job.user);
  res.status(StatusCodes.OK).json({ status: "Success!", msg: "Job removed!" });
};

module.exports = {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  showMyJobs,
};
