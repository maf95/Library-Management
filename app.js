const express = require("express");
require("dotenv").config();
const admin = require("./routes/admin");
const errorController = require("./controllers/errors");
const path = require("path");
const { static } = require("express");
const db = require("./util/databaseConnection");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const nocache = require("nocache");
const flash = require("connect-flash");
const csrf = require("csurf");
const password = process.env.PASSWORD_MONGODB;
const dbURI =
    "mongodb+srv://catalin:" +
    password +
    "@cluster0.ecbtg.mongodb.net/Library?retryWrites=true&w=majority";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "views");
const csrfProtection = csrf();

app.use(nocache());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const store = new MongoDBStore({
    uri: dbURI,
    collection: "sessions",
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(admin);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    let role = "";
    if (req.session.user) {
        role = req.session.user.role;
    }
    res.status(500).render("error/500", {
        pageTitle: "Error!",
        error: error,
        role: role,
    });
});

app.listen(3000, console.log("Server started on port 3000"));