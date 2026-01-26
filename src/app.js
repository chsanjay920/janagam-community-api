// Express app configuration
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors()); 
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", require("./routes/registration.routes"));

module.exports = app;
