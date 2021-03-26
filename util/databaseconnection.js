const mongoose = require("mongoose");
const password = process.env.PASSWORD_MONGODB;
const dbURI =
    "mongodb+srv://catalin:" +
    password +
    "@cluster0.ecbtg.mongodb.net/Library?retryWrites=true&w=majority";

const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(dbURI, connectionOptions);

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected on Library database");
});

mongoose.connection.on("err", () => {
    console.log("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from Library database");
});

process.on("SIGINT", () => {
    mongoose.connection.close(() => {
        console.log("Mongoose closed due to app termination.");
        process.exit(0);
    });
});