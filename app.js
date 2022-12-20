const express = require("express");
const { default: mongoose } = require("mongoose");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");

//this will allow us to pull params from .env file
require("dotenv/config");
const cors = require("cors");

app.use(cors());
app.options("*", cors);

const api = process.env.API_URL;
const productsRouter = require("./routers/Products");
const usersRouter = require("./routers/Users");
const ordersRouter = require("./routers/Orders");
const categoriesRouter = require("./routers/Categories");

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

// Middleware
//This middleware(express.json()) will allow us to pull req.body.<params>
// app.use(express.json());
// // To support JSON-encoded bodies.
app.use(bodyParser.json());

app.use(morgan("combined"));
app.use(authJwt());
// Error handling in API
app.use(errorHandler);
// make the public folder static
app.use("/public/uploads/", express.static(__dirname + "/public/uploads/"));

// Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);

// Connect to database
mongoose
  //get the port number from .env file
  .connect(process.env.CONNECTION_STRING, {
    dbName: "eshop-database",
  })
  .then(() => {
    console.log("Database connection ready!");
  })
  .catch((err) => {
    console.log(err);
  });

// development
// app.listen(3000, () => {
//   console.log("Server listening on port http://localhost:3000");
// });

// production
var server = app.listen(process.env.PORT || 3000, () => {
  var port = server.address().port;
  console.log(`Server listening on port http://localhost:${port}`);
});
