const asyncHandler = require("express-async-handler");
const admin = require("firebase-admin");
const agora = require("agora-access-token");
const moment = require("moment");

const serviceAccount = require("../../firesbaseConfig.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other configuration options
});

// Firestore instance
const db = admin.firestore();

const getAllMeetings = asyncHandler(async (req, res) => {
  try {
    const snapshot = await db.collection("meeting").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const parsedMeetingData = items.map((item) => ({
      ...item,
      date: moment(item.date), // Assuming 'date' is the property containing the date string
    }));
    // Sort the parsed data based on the 'date' property
    const sortedMeetingData = parsedMeetingData.sort((a, b) => b.date - a.date);
    return res.json(sortedMeetingData || []);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const getMeetingId = asyncHandler(async (req, res) => {
  try {
    if (!req.params.id) return; // Ensure the ID is provided

    // const docRef = db.collection("meeting").doc(req.params.id);
    // const doc = await docRef.get();

    const snapshot = await db.collection("meeting").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const data = items.find((item) => item.id === req.params.id);
    if (!data) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const createMeeting = asyncHandler(async (req, res) => {
  try {
    const newItem = req.body;
    const docRef = await db.collection("meeting").add(newItem);
    return res.json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const editMeeting = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const updatedItem = req.body;
    console.log("Updated Item:", updatedItem); // Debugging

    const docRef = db.collection("meeting").doc(id);
    await docRef.update(updatedItem);

    console.log("Document updated successfully"); // Debugging
    return res.json({ id: docRef.id, ...updatedItem });
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const deleteMeeting = asyncHandler(async (req, res) => {
  try {
    if (!req.params.id) return;
    const docRef = db.collection("meeting").doc(req.params.id);
    await docRef.delete();
    return res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const generateAgoraToken = asyncHandler(async (req, res) => {
  const userId = 0;
  const { channelName, startDate } = req.body;

  const agoraAppId = process.env.AGORA_APP_ID || "";
  const agoraAppCertificate = process.env.AGORA_APP_CERTIFICATE || "";
  const startDateObject = new Date(startDate);
  const expirationTimeInSeconds =
    Math.floor(startDateObject.getTime() / 1000) + 86400;

  const token = agora.RtcTokenBuilder.buildTokenWithUid(
    agoraAppId,
    agoraAppCertificate,
    channelName,
    userId,
    agora.RtcRole.PUBLISHER,
    expirationTimeInSeconds
  );

  return res.json({ token });
});

module.exports = {
  deleteMeeting,
  editMeeting,
  createMeeting,
  getMeetingId,
  getAllMeetings,
  generateAgoraToken,
};
