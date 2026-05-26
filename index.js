require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const videoRoutes = require("./routes/videoRoutes");
const shortRoutes = require("./routes/shortRoutes");
const articleRoutes = require("./routes/articleRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");

const app = express();

const connectDB = require("./config/db");

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/shorts", shortRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/contact-messages", contactMessageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});