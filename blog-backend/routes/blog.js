const express = require("express");
const {createBlog, getUserBlog, deleteBlog, editBlog, getHomepageBlogs} = require("../controllers/bolg.controllers");
const { isAuth } = require("../middlewares/AuthMiddleware");
const app = express();

app.post("/create-blog", isAuth, createBlog);
app.get("/get-user-blogs", isAuth, getUserBlog);
app.delete("/delete-blog/:blogid", isAuth, deleteBlog);
app.put("/edit-blog", isAuth, editBlog);
app.get("/homepage-blogs", isAuth, getHomepageBlogs);

module.exports = app;