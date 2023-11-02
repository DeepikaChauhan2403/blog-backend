const express = require("express");
const { registerUser, loginUser, getAllUsers } = require("../controllers/user.controllers")
const app = express();
const {isAuth} = require("../middlewares/AuthMiddleware");

app.post("/register", registerUser);
app.post("/login", loginUser);
app.get("/get-all-users", isAuth, getAllUsers);

module.exports = app;