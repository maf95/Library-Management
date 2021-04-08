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

    res.render("users/admin", {
        pageTitle: "Admin's page",
        name: req.session.user.name,
        users: users,
        userId: userId,
        hasPrevious: page > 1,
        hasNext: page < Math.ceil(totalUsers / 3),
        page: page,
        nextPage: page + 1,
        previousPage: page - 1,
        totalPage: Math.ceil(totalUsers / 3),
    });
};

exports.getLibrarian = async(req, res, next) => {
    const page = +req.query.page || 1;
    const totalUsers = await User.find().countDocuments();
    const users = await User.find()
        .skip((page - 1) * 3)
        .limit(3);
    const userId = req.session.user._id;

    res.render("users/librarian", {
        pageTitle: "Librarian's page",
        name: req.session.user.name,
        users: users,
        userId: userId,
        hasPrevious: page > 1,
        hasNext: page < Math.ceil(totalUsers / 3),
        page: page,
        nextPage: page + 1,
        previousPage: page - 1,
        totalPage: Math.ceil(totalUsers / 3),
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
        if (!user) {
            return res.redirect("/");
        }

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
exports.getNewArticle = (req, res, next) => {
    res.render("articles/new-article", { pageTitle: "Add new article" });
};

exports.getChangePassword = (req, res, next) => {
    res.render("users/change-password", { pageTitle: "Change Password" });
};

exports.getManageUsers = async(req, res, next) => {
    const current = req.session.user.userName;
    // const users = await User.find();
    // res.render("users/manage-users", {
    //     pageTitle: "Manage users",
    //     users: users,
    //     currentUser: current,
    // });
    const page = +req.query.page || 1;
    const totalUsers = await User.find().countDocuments();
    const users = await User.find()
        .skip((page - 1) * 5)
        .limit(5);
    const userId = req.session.user._id;

    res.render("users/manage-users", {
        pageTitle: "Manage users",
        name: req.session.user.name,
        users: users,
        userId: userId,
        hasPrevious: page > 1,
        hasNext: page < Math.ceil(totalUsers / 5),
        page: page,
        nextPage: page + 1,
        previousPage: page - 1,
        totalPage: Math.ceil(totalUsers / 5),
        currentUser: current,
    });
};

exports.getLibrary = (req, res, next) => {
    res.render("articles/library", { pageTitle: "Library" });
};

exports.getAddFromFile = (req, res, next) => {
    const error = req.flash("error") || "";
    res.render("articles/add-from-file", {
        pageTitle: "Add from file",
        errorMessage: error,
    });
};