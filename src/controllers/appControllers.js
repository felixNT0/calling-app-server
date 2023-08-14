const asyncHandler = require("express-async-handler");
const admin = require("firebase-admin");

const serviceAccount = require("../../firesbaseConfig.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other configuration options
});

// Firestore instance
const db = admin.firestore();

const getAllMeetings = asyncHandler(async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(items || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const getMeetingId = asyncHandler(async (req, res) => {
  try {
    if (!req.params.id) return;
    const docRef = db.collection("meeting").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.json({ id: doc.id, ...doc.data() });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const createMeeting = asyncHandler(async (req, res) => {
  try {
    const newItem = req.body;
    const docRef = await db.collection("meeting").add(newItem);
    res.json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const editMeeting = asyncHandler(async (req, res) => {
  try {
    if (!req.params.id) return;
    const updatedItem = req.body;
    const docRef = db.collection("meeting").doc(req.params.id);
    await docRef.update(updatedItem);
    res.json({ id: docRef.id, ...updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const deleteMeeting = asyncHandler(async (req, res) => {
  try {
    if (!req.params.id) return;
    const docRef = db.collection("meeting").doc(req.params.id);
    await docRef.delete();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = {
  deleteMeeting,
  editMeeting,
  createMeeting,
  getMeetingId,
  getAllMeetings,
};