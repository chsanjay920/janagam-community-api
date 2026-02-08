// Express app configuration
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", require("./routes/registration.routes"));

module.exports = app;
