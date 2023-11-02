const { ERR, TRUE, FALSE } = require("../constants");
const BlogsSchema = require("../modles/BlogsSchema");

const addBlogToDB = async (blogObj) => {
  try {
    await blogObj.save();
    return TRUE;
  } catch (err) {
    return ERR;
  }
};


const getUserBlogsFromDB = async (userId, page, LIMIT) => {
  let blogsData = {
    data: null,
    err: null,
  };

  try {
    blogsData.data = await BlogsSchema.find({ userId, isDeleted: false })// 2 - will fetch where userId match and isDeleted is false
      .sort({ creationDateTime: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    return blogsData;
  }
  catch (err) {
    blogsData.err = err;

    return blogsData;
  }
};


const getBlogDataFromDB = async (blogId) => {
  let blogData = {
    data: null,
    err: null,
  };

  try {
    blogData.data = await BlogsSchema.findOne({ _id: blogId });

    return blogData;
  } catch (err) {
    blogData.err = err;
    return blogData;
  }
};


const deleteBlogFromDB = async (blogId) => {
  try {
    await BlogsSchema.findByIdAndUpdate(blogId, { // 1 - will not delet, will find and change isDeleted to ture 
      isDeleted: true,
      deletionDateTime: Date.now(),
    });

    return TRUE;
  } catch (err) {
    return ERR;
  }
};


const updateBlogInDB = async (blogId, newBlogObj) => {
  try{
    await BlogsSchema.findByIdAndUpdate({_id: blogId }, newBlogObj);
    return TRUE;
  }
  catch(err) {
    return ERR;
  }
};

const getFollowingBlogsFromDB = async (followingUserIds) => {
  let followingBlogsDate = {
    data: null,
    err: null,
  };

  try {
    followingBlogsDate.data = await BlogsSchema.find({
      userId: { $in: followingUserIds },
      isDeleted: false,
    });

    return followingBlogsDate;
  } catch (err) {
    followingBlogsDate.err = err;
    return followingBlogsDate;
  }
}

module.exports = { addBlogToDB, getUserBlogsFromDB, getBlogDataFromDB, deleteBlogFromDB, updateBlogInDB, getFollowingBlogsFromDB };