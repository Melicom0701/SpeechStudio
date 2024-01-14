require("dotenv").config();
const express = require("express");
const appRoutes = require('./src/routes')
const app = express();
const port =  process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", appRoutes);


app.listen( port, function () {
  console.log("Your app running on port " + port);
});