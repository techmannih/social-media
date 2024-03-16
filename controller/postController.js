const { Post } = require("../models/postSchema");
const { User } = require("../models/userSchema");
module.exports.createPost = async (req, res) => {
  const { title, body, image } = req.body;
  const newPost = new Post({
    title,
    body,
    image,
    userId: req.user.userId, // Automatically populate userId based on the authenticated user's ID
  });
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getUserPosts = async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.user.userId });
    console.log(userPosts);
    if (userPosts.length === 0) {
      return res.status(404).json({ message: "No posts found for the user" });
    }

    res.status(200).json(userPosts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getAllFollowingPosts = async (req, res) => {
  try {
    // Find the user with ID "0b6603d0-0a65-4c48-989a-d5bc47523323" (ankit)
    const user = await User.findOne({ userId: req.user.followings });
    console.log("usere", user);
    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find posts of the users whom User 2 (ankit) is following
    const userPosts = await Post.find({ userId: { $in: user.userId } });
    console.log("userpost", userPosts);
    // Return the user posts
    res.status(200).json(userPosts);
  } catch (err) {
    // Handle internal server error
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json(deletedPost);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// get a post
module.exports.getPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Update a post by ID
module.exports.updatePost = async (req, res) => {
  try {
    const { title, body, image } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { title, body, image },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};