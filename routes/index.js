const express = require('express');
const sendEmail = require('../coutrollers/userControllers').sendEmail;
const userInfo = require('../coutrollers/userControllers').userInfo;
const createNewAccount = require('../coutrollers/accountController').createNewAccount;
const userExistency = require('../coutrollers/userControllers').getUserExistency;
const getUserActivity = require('../coutrollers/activityController').getUserActivity;

const router = express.Router();

router.post("/sendmail", sendEmail);

router.post("/userinfo", userInfo);

router.post("/createaccount", createNewAccount);

router.post("/users", userExistency);

router.get("/activities", getUserActivity);

module.exports = router;