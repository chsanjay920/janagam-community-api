const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

const corsOptions = {
  origin: "https://janagam-community-web-test.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

app.use(express.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", require("./routes/registration.routes"));

module.exports = app;
