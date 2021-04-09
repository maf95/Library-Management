const bcrypt = require("bcryptjs");
//const { parse } = require('dotenv/types');
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const io = require("../socket");
const fs = require("mz/fs");
const path = require("path");
const helper = require("../util/helperFunctions");
const Article = require("../models/article");
const neatCsv = require("neat-csv");
exports.postUpdateUser = async(req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessage = errors.array()[0].msg;
        return res.render("users/update-user", {
            pageTitle: "Update your data",
            user: {
                userName: req.body.user,
                name: req.body.name,
                email: req.body.email,
                mobilePhone: req.body.mobilePhone,
                officePhone: req.body.officePhone,
                role: req.session.user.role,
            },
            errorMessage: errorMessage,
        });
    }
    const userId = req.session.user._id;
    const userName = req.body.user;
    const name = req.body.name;
    const email = req.body.email;
    const mobilePhone = req.body.mobilePhone;
    const officePhone = req.body.officePhone;
    try {
        const user = await User.findByIdAndUpdate(
            userId, {
                userName: userName,
                name: name,
                email: email,
                mobilePhone: mobilePhone,
                officePhone: officePhone,
            }, { new: true }
        );
        req.session.user = user;
        if (req.session.user.role === "admin") {
            res.redirect("/admin");
        } else {
            res.redirect("/librarian");
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

exports.postNewUser = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0].msg;
        return res.render("users/new-user", {
            pageTitle: "Add new user",
            errorMessage: error,
            oldValue: {
                name: req.body.name,
                userName: req.body.username,
                password: req.body.password,
            },
        });
    }
    try {
        const hashedPw = await bcrypt.hash(req.body.password, 12);
        const user = new User({
            userName: req.body.username,
            name: req.body.name,

            password: hashedPw,
            role: req.body.position,
        });
        await user.save();
        io.getIo().emit("newUserCreated", { message: "New user was created!!" });
        res.redirect("/admin");
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

exports.postLogin = async(req, res, next) => {
    try {
        let user = await User.findOne({ userName: req.body.user });

        if (!user) {
            req.flash("error", "Incorrect username");
            req.flash("user", req.body.user);

            return res.redirect("/authenticate");
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            req.flash("error", "Wrong password!");
            req.flash("pass", req.body.password);
            req.flash("user", req.body.user);
            return res.redirect("/authenticate");
        }

        const userId = user._id;
        user = await User.findByIdAndUpdate(
            userId, { connected: true }, { new: true }
        );
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save((err) => {
            if (err) {
                console.log(err);
            }
        });
        io.getIo().emit("logon", { message: "Connected!", userId: user._id });

        if (user.firstLogin) {
            req.flash("succes", "At first logn you are required to change password!");
            return res.redirect("/change-password");
        }

        if (user.role === "admin") {
            req.flash("succes", "Successfully login as administrator!");
            return res.redirect("/admin");
        }
        if (user.role === "librarian") {
            req.flash("succes", "Successfully login as librarian!");
            return res.redirect("/librarian");
        }

        const error = new Error("Unknown error in authentication");
        throw error;
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

exports.postChangePassword = async(req, res, next) => {
    try {
        const user = await User.findOne({ userName: req.body.user });
        if (!user) {
            return res.redirect("/change-password");
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return res.redirect("/change-password");
        }
        if (req.body.passwordNew !== req.body.passwordConfirm) {
            return res.redirect("/change-password");
        }
        const hashedPw = await bcrypt.hash(req.body.passwordNew, 12);
        const newUser = await User.findOneAndUpdate({ userName: req.body.user }, { password: hashedPw, firstLogin: false }, { new: true });
        req.session.user = newUser;
        if (user.role === "admin") {
            return res.redirect("/admin");
        }
        if (user.role === "librarian") {
            return res.redirect("/librarian");
        }
        const error = new Error("Unknown error during changing password");
        throw error;
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

exports.postLogout = async(req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.session.user._id, {
                connected: false,
            }, { new: true }
        );
        if (!user) {
            return res.redirect("/");
        }
        io.getIo().emit("logout", { message: "Disconnected!", userId: user._id });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }

    req.session.destroy(() => {
        res.redirect("/");
    });
};

exports.postDeleteUser = async(req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (user.role === "admin") {
            const users = await User.find({ role: "admin" });
            if (users.length === 1) {
                return res.redirect("/");
            }
        }
        await User.findByIdAndDelete(userId, (err) => {
            if (err) {
                return res.redirect("/manage-users");
            }
            io.getIo().emit("deleteUser", {
                message: "User deleted!",
                userId: userId,
            });
            res.redirect("/manage-users");
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

exports.postAddFromFile = async(req, res, next) => {
    try {
        let articles = [];
        const extension = req.file.originalname.split(".")[1];
        if (extension === "csv") {
            const data = await fs.readFile(
                path.join(__dirname, "..", "files", "data.csv")
            );
            articles = await neatCsv(data);
            const records = helper.createRecord(articles);

            fs.unlink(path.join(__dirname, "..", "files", "data.csv"), (err) => {
                if (err) {
                    throw new Error(err);
                }
                req.flash(
                    "succes",
                    records + " records were succesfully added to the database."
                );
                res.redirect("/add-from-file");
            });
        } else if (extension === "json") {
            const data = await fs.readFile(
                path.join(__dirname, "..", "files", "data.json")
            );
            articles = JSON.parse(data);
            const records = helper.createRecord(articles);
            fs.unlink(path.join(__dirname, "..", "files", "data.json"), (err) => {
                if (err) {
                    throw new Error(err);
                }
            });
            req.flash(
                "succes",
                records + " records were succesfully added to the database."
            );
            res.redirect("/add-from-file");
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};