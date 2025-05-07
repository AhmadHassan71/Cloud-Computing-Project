const express = require("express");
const AuthRouter = express.Router();

const { 
    RegisterUser,
    LoginUser,
 } = require("../controller/auth.controller");

AuthRouter.post('/register', RegisterUser);
AuthRouter.post('/login', LoginUser);

module.exports = AuthRouter;