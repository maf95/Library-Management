const bcrypt = require("bcryptjs");
//const { parse } = require('dotenv/types');
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const io = require("../socket");

exports.getIndex = (req, res, next) => {
    res.render("users/index", { pageTitle: "Welcome to Library" });
};

exports.getLogin = (req, res, next) => {
    const errors = req.flash("error");
    const userName = req.flash("user")[0] || "";
    const pass = req.flash("pass")[0] || "";
    let error = "";
    if (errors.length > 0) {
        error = errors[0];
    }
    res.render("users/login", {
        pageTitle: "Login",
        error: error,
        user: userName,
        pass: pass,
    });
};

exports.getAdmin = async(req, res, next) => {
    const page = +req.query.page || 1;
    const totalUsers = await User.find().countDocuments();
    const users = await User.find()
        .skip((page - 1) * 3)
        .limit(3);
    const userId = req.session.user._id;
    console.log(req.flash("succes"));

    res.render("users/admin", {
        pageTitle: "Admin's page",
        name: req.session.user.name,
        users: users,
        userId: userId,
        hasPrevious: page > 1,
        page: page,
        nextPage: page + 1,
        previousPage: page - 1,
        totalPage: Math.ceil(totalUsers / 3),
    });
};

exports.getLibrarian = (req, res, next) => {
    console.log(req.flash("succes"));
    res.render("users/librarian", {
        pageTitle: "Librarian's page",
        userId: req.session.user._id,
        succes: req.flash("succes"),
    });
};

exports.getNewUser = (req, res, next) => {
    res.render("users/new-user", {
        pageTitle: "Add new user",
        errorMessage: "",
        oldValue: {},
    });
};

exports.getUpdateUser = async(req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);

        res.render("users/update-user", {
            pageTitle: "Update your data",
            user: user,
            errorMessage: "",
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    }
};

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

exports.getNewArticle = (req, res, next) => {
    res.render("articles/new-article", { pageTitle: "Add new article" });
};

exports.getChangePassword = (req, res, next) => {
    console.log(req.flash("succes"));
    res.render("users/change-password", { pageTitle: "Change Password" });
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
        console.log("User created");
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
            console.log("from not user");
            return res.redirect("/authenticate");
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            console.log("from not match");
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
            console.log(err);
        });
        io.getIo().emit("logon", { message: "Connected!", userId: user._id });

        if (user.firstLogin) {
            req.flash("succes", "At first logn you are required to chamge password!");
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
        const user = await User.findByIdAndUpdate(req.session.user._id, {
            connected: false,
        });
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