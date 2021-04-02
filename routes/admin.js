const express = require("express");
const adminController = require("../controllers/postControllers");
const routeProtection = require("../middleware/route-protection.js");
const { check } = require("express-validator");
const User = require("../models/user");
const getControllers = require("../controllers/getControllers");
const postControllers = require("../controllers/postControllers");

const router = express.Router();

router.get("/", getControllers.getIndex);

router.get("/authenticate", getControllers.getLogin);

router.post("/authenticate", adminController.postLogin);

router.post("/logout", adminController.postLogout);

router.get(
    "/change-password",

    getControllers.getChangePassword
);

router.post("/change-password", adminController.postChangePassword);

router.get("/admin", routeProtection.isAdmin, getControllers.getAdmin);

router.get(
    "/librarian",
    routeProtection.isLibrarian,
    getControllers.getLibrarian
);

router.get("/new-user", routeProtection.isAdmin, getControllers.getNewUser);

router.post(
    "/new-user", [
        check("name").custom((value) => {
            const regEx = /^[a-z]*$/;
            const words = value.split(" ");
            const name = words.reduce((s, w) => s + w, "").toLowerCase();
            if (name.match(regEx)) {
                return true;
            }
            throw "Name should only contains letters!";
        }),
        check("username").custom((value) => {
            return User.findOne({ userName: value }).then((user) => {
                if (user) {
                    return Promise.reject(
                        "Username alrready in use. Pick a different one!"
                    );
                }
            });
        }),
        check("password")
        .isLength({ min: 1 })
        .withMessage("Password field cannot be empty!"),
        check("position").custom((value) => {
            console.log(value);
            if (value != "admin" && value != "librarian") {
                throw "User should have a role assigned!";
            }
            return true;
        }),
    ],
    routeProtection.isAdmin,
    adminController.postNewUser
);

router.get("/new-article", getControllers.getNewArticle);

router.get(
    "/update-user/:userId",
    routeProtection.isCorrectUser,
    getControllers.getUpdateUser
);

router.post(
    "/update-user", [
        check("user").custom((value, { req }) => {
            return User.findOne({ userName: value }).then((user) => {
                if (user) {
                    if (user._id.toString() !== req.session.user._id.toString()) {
                        return Promise.reject("Username in use. Chose a different one!");
                    }
                }
                return true;
            });
        }),
        check("name").custom((value) => {
            const regEx = /^[a-z]*$/;
            const words = value.split(" ");
            const name = words.reduce((s, w) => s + w, "").toLowerCase();
            if (name.match(regEx)) {
                return true;
            }
            throw "Name should only contains letters!";
        }),
        check("email").isEmail().withMessage("Not a valid email address!"),
        check("email").custom((value, { req }) => {
            return User.findOne({ email: value }).then((user) => {
                if (user) {
                    if (user._id.toString() !== req.session.user._id.toString()) {
                        return Promise.reject("Email in use. Chose a different one!");
                    }
                }
                return true;
            });
        }),
        check("mobilePhone")
        .isMobilePhone("ro-RO")
        .withMessage("Not a valid mobile phone number!"),
        check("officePhone")
        .isNumeric()
        .withMessage("Office phone number should contain only numbers!"),
    ],

    postControllers.postUpdateUser
);

router.get(
    "/manage-users",
    routeProtection.isAdmin,
    getControllers.getManageUsers
);

router.post("/delete-user/:userId", postControllers.postDeleteUser);

module.exports = router;