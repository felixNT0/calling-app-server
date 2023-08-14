const express = require("express");
const {
  getAllMeetings,
  getMeetingId,
  createMeeting,
  editMeeting,
  deleteMeeting,
} = require("../controllers/appControllers.js");

const router = express.Router();

router.get("/", getAllMeetings);
router.post("/", createMeeting);
router.get("/:id", getMeetingId);
router.put("/:id", editMeeting);
router.delete("/:id", deleteMeeting);

module.exports = router;
