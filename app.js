const express = require("express");
require('dotenv').config();
const admin = require("./routes/admin");
const path = require("path");
const { static } = require("express");
const db = require("./util/databaseConnection");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const password = process.env.PASSWORD_MONGODB;
const dbURI =
    "mongodb+srv://catalin:" +
    password +
    "@cluster0.ecbtg.mongodb.net/Library?retryWrites=true&w=majority";


const app = express();
app.use(express.urlencoded({extended:true}))
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const store = new MongoDBStore({
    uri:dbURI,
    collection:'sessions'
})

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store:store
}))

app.use(admin);

app.listen(3000, console.log("Server started on port 3000"));