const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ quiet: true });
const mongoString = process.env.DATABASE_URL;
const routes = require("./routes/routes");
const app = express();
mongoose.set("strictQuery", true);
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("database connected");
});

app.use(express.json());
app.use("/api", routes);

app.listen(3000, () => {
  console.log("running on http://localhost:3000");
});
