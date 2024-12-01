// Kfir-Weissman-323909945-Gil-Shimshon-322261488

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.DATABASE_PORT;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(`${process.env.DATABASE_URL}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Routes
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
