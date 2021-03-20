const express = require("express");
const adminController = require("../controllers/admin");
const routeProtection = require('../middleware/route-protection.js')

const router = express.Router();

router.get("/", adminController.getIndex);

router.get('/authenticate', adminController.getLogin)

router.post('/authenticate', adminController.postLogin)

router.post('/logout',adminController.postLogout)

router.get('/change-password',adminController.getChangePassword)

router.post('/change-password', adminController.postChangePassword)

router.get('/admin',routeProtection.isAdmin, adminController.getAdmin)

router.get('/librarian',adminController.getLibrarian)

router.get('/new-user', adminController.getNewUser)

router.post('/new-user',adminController.postNewUser)

router.get('/new-article',adminController.getNewArticle)

router.get('/update-user/:userId')

module.exports = router;