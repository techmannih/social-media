const { User } = require("../models/userSchema");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const maxAge = 2 * 24 * 60 * 60;


function getToken(userID) {
  return jwt.sign({ userID }, process.env.SECRET_KEY, {
    expiresIn: maxAge,
  });
}

const handleErrors = (err) => {
  const errors = { name: "", email: "", password: "" };

  // error code
  if (err.code == 11000) {
    errors["email"] = "email already used";
  }

  // invalid email OR password - login
  if (err.message == "invalid email") {
    errors.email = "invalid email";
  }
  if (err.message == "invalid password") {
    errors.password = "invalid password";
  }

  // validation of email & password - signup
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

module.exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("Signing up");

  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    console.log("exist user", existingUser);
    if (existingUser) {
      // User with the same email already exists
      return res.status(400).json({
        errors: {
          email: "Email is already in use. Please choose a different email.",
        },
      });
    } else {
      // Create a new user
      const user = await User.create({ fullName, email, password });

      // You may want to generate a JWT token and send it in the response for user authentication
      console.log("new user", user);
      res.status(201).json({ success: "Signed up successfully" });
    }
  } catch (err) {
    console.error("Error signing up", err);

    // Handle other errors
    const errors = handleErrors(err); // You need to define the handleErrors function
    res.status(500).json({ errors });
  }
};
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("logging in");
  try {
    const user = await User.login(email, password);

    if (!user) {
      // User not found or invalid credentials
      throw new Error("invalid credentials");
    }

    // Authentication successful
    const validToken = getToken(user._id);
    res.status(200).json({ success: validToken, userId: user._id });
    console.log("logged data", user);
  } catch (err) {
    console.log("error logging in:", err.message);
    const errors = handleErrors(err);
    res.status(401).json({ errors, message: err.message }); // Include the error message in the response
  }
};

// Controller to get user profile
module.exports.getUserProfile = async (req, res) => {
  const userEmail = req.params.email; // Retrieve email from request parameters

  try {
    const userProfile = await User.findOne({ email: userEmail }); // Find user by email
    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(userProfile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to update user profile
module.exports.updateProfile = async (req, res) => {
  const { email } = req.params; // Extract email from route parameters
  const { fullName, bio } = req.body;

  try {
    const updatedUserProfile = await User.findOneAndUpdate(
      { email }, // Find user by email
      { fullName, bio },
      { new: true } // Ensure the updated document is returned
    );

    if (!updatedUserProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUserProfile);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to delete user profile
module.exports.deleteUserProfile = async (req, res) => {
  try {
    // // Check if user information is available in the request object
    // if (!req.user || !req.user.userId) {
    //   return res
    //     .status(401)
    //     .json({ error: "Unauthorized: No user information found" });
    // }

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(req.params.id);

    // Check if user exists and deletion was successful
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If deletion is successful, send success message
    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (err) {
    // Handle any errors that occur during deletion
    console.error("Error deleting user profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
//controller to update followings

module.exports.updatefollow = async (req, res) => {
  const { followId } = req.body;
  const userId = req.user.userId;

  // Log request details
  console.log("Request body:", req.body);
  console.log("User ID:", userId);

  // Check if the user is trying to follow themselves
  if (userId === followId) {
    console.log("Cannot follow self:", userId);
    return res.status(400).json({ status: "cannot follow self" });
  }

  try {
    // Find the user in the database
    const user = await User.findOne({ userId: userId });

    console.log("User:", user);

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ status: "User not found" });
    }

    // Log the value of followId
    console.log("followId:", followId);

    // Check if the user is already following the target user
    const isFollowing = user.followings.includes(followId);

    console.log("Is following:", isFollowing);

    if (isFollowing) {
      // If the user is already following, unfollow them
      await User.findOneAndUpdate(
        { userId: userId },
        { $pull: { followings: followId } }
      );
      await User.findOneAndUpdate(
        { userId: followId },
        { $pull: { followers: userId } }
      );
      console.log("Unfollowed:", followId);
      return res.status(200).json({ status: "unfollowed" });
    } else {
      // If the user is not following, follow them
      await User.findOneAndUpdate(
        { userId: userId },
        { $push: { followings: followId } }
      );
      await User.findOneAndUpdate(
        { userId: followId },
        { $push: { followers: userId } }
      );
      console.log("Followed:", followId);
      return res.status(200).json({ status: "followed" });
    }
  } catch (error) {
    console.error("Error updating follow:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
//controller to get followers

module.exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followers = user.followers || [];

    // Fetch followers' data with additional details
    const followersData = await Promise.all(
      followers.map(async (followerId) => {
        try {
          // Find follower user by ID
          const follower = await User.findOne({ userId: followerId });
          return follower;
        } catch (err) {
          console.error("Error fetching follower:", err);
          return null; // Return null if there's an error fetching the follower
        }
      })
    );

    // Filter out null values and return followers' data
    const filteredFollowersData = followersData.filter(Boolean);

    res.status(200).json({ followersData: filteredFollowersData });
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//controller to get followings
module.exports.getFollowings = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followings = user.followings || [];

    // Fetch followings' data with additional details
    const followingsData = await Promise.all(
      followings.map(async (followingId) => {
        try {
          // Find following user by ID
          const following = await User.findOne({ userId: followingId });
          return following;
        } catch (err) {
          console.error("Error fetching following:", err);
          return null; // Return null if there's an error fetching the following
        }
      })
    );

    // Filter out null values and return followings' data
    const filteredFollowingsData = followingsData.filter(Boolean);

    res.status(200).json({ followingsData: filteredFollowingsData });
  } catch (err) {
    console.error("Error fetching followings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
