const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createPost,
  getUserPosts,
  getAllFollowingPosts,
  deletePost,
  getPosts,
  updatePost,
} = require("../controller/postController");

// Post routes
router.route("/post/new").post(authMiddleware, createPost);
// get user profile posts
router.route("/posts/profileposts/:userId").get(authMiddleware, getUserPosts);
// get all posts of followings
router
  .route("/posts/all")
  .get(authMiddleware, getAllFollowingPosts);
// get a post
router.route("/post/get/:postId").get(authMiddleware, getPosts);
router.route("/post/update/:postId").put(authMiddleware, updatePost);
// delete a post

router.route("/post/delete/:postId").delete(authMiddleware, deletePost);

module.exports = router;
