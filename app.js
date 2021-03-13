const express = require("express");
require("dotenv").config();
const admin = require("./routes/admin");
const path = require("path");
const { static } = require("express");
const db = require("./util/databaseConnection");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

app.use(admin);

app.listen(3000, console.log("Server started on port 3000"));