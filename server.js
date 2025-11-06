import express from "express";
import multer from "multer";
import cors from "cors";
import { google } from "googleapis";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ✅ Securely load credentials from environment variables
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

app.get("/", (req, res) => res.send("✅ Interview Bot API is running on Render!"));

app.post("/save", async (req, res) => {
  try {
    const { Name, Phone, Aadhaar, Score, Date } = req.body;
    console.log("📥 Received data:", req.body);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Interviews!A1:E1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[Name, Phone, Aadhaar, Score, Date]] },
    });

    res.json({ status: "success", message: "Data saved to Google Sheet" });
  } catch (err) {
    console.error("❌ Error saving data:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(4000, () => console.log("🚀 API running on port 4000"));