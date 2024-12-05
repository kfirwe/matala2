// Kfir-Weissman-323909945-Gil-Shimshon-322261488

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const {
  authMiddleware,
  refreshTokenMiddleware,
} = require("./middlewares/authMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swaggerConfig");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/posts", authMiddleware, refreshTokenMiddleware, postRoutes);
app.use("/comments", authMiddleware, refreshTokenMiddleware, commentRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
