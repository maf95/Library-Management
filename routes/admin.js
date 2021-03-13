const express = require("express");
const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/", adminController.getIndex);

router.get('/authenticate', adminController.getLogin)

router.get('/admin',adminController.getAdmin)

router.get('/librarian',adminController.getLibrarian)

router.get('/new-user', adminController.getNewUser)

router.get('/new-article',adminController.getNewArticle)

module.exports = router;