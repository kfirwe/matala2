// swaggerConfig.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
      description: "A simple Express API application documented with Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;