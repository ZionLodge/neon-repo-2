const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(uploadFolder));

// UPLOAD
app.post("/upload", upload.array("files"), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);
  res.json({ uploaded: urls });
});

// LIST FILES
app.get("/files", (req, res) => {
  const files = fs.readdirSync(uploadFolder);
  const urls = files.map(f => `${req.protocol}://${req.get("host")}/uploads/${f}`);
  res.json(urls);
});

// DELETE ONE
app.delete("/delete/:filename", (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ deleted: true });
  } else res.status(404).json({ error: "File not found" });
});

// CLEAN ALL
app.delete("/clean", (req, res) => {
  fs.readdirSync(uploadFolder).forEach(f => fs.unlinkSync(path.join(uploadFolder, f)));
  res.json({ cleaned: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
