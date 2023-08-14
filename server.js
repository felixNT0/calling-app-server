const express = require("express");
const agora = require("agora-access-token");
const cors = require("cors");
const { config } = require("dotenv");
const router = require("./src/routes/routes");
const bodyParser = require("body-parser");
config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cors());
const allowedOrigins = [
  "https://fkt-calling-app.vercel.app/",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// GET all meeting
app.use("/meeting", router);

app.post("/agora/token", (req, res) => {
  const userId = 0;
  const channelName = req.body.channelName;

  const agoraAppId = process.env.AGORA_APP_ID || "";
  const agoraAppCertificate = process.env.AGORA_APP_CERTIFICATE || "";

  const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 86400;

  const token = agora.RtcTokenBuilder.buildTokenWithUid(
    agoraAppId,
    agoraAppCertificate,
    channelName,
    userId,
    agora.RtcRole.PUBLISHER,
    expirationTimeInSeconds
  );

  res.json({ token });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
