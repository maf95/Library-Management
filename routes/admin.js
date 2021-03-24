const express = require("express");
const adminController = require("../controllers/admin");
const routeProtection = require("../middleware/route-protection.js");
const { check } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

router.get("/", adminController.getIndex);

router.get("/authenticate", adminController.getLogin);

router.post("/authenticate", adminController.postLogin);

router.post("/logout", adminController.postLogout);

router.get("/change-password", adminController.getChangePassword);

router.post("/change-password", adminController.postChangePassword);

router.get("/admin", routeProtection.isAdmin, adminController.getAdmin);

router.get(
    "/librarian",
    routeProtection.isLibrarian,
    adminController.getLibrarian
);

router.get("/new-user", routeProtection.isAdmin, adminController.getNewUser);

router.post("/new-user", routeProtection.isAdmin, adminController.postNewUser);

router.get("/new-article", adminController.getNewArticle);

router.get(
    "/update-user/:userId",
    routeProtection.isCorrectUser,
    adminController.getUpdateUser
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
    adminController.postUpdateUser
);

module.exports = router;