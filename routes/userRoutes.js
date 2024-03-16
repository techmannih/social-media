const { Router } = require("express");
const authMiddleware = require("../middleware/auth");
const {
  signup,
  login,
  getUserProfile,
  updateProfile,
  deleteUserProfile,
  updatefollow,
  getFollowers,
  getFollowings,
  getAllUsers,
} = require("../controller/userController");

const router = Router();

router.route("/login").post(login);
router.route("/signup").post(signup);

// Protected routes requiring authentication
router.route("/profile/:email").get(authMiddleware, getUserProfile);
router.route("/allUser").get(authMiddleware, getAllUsers);
router.route("/profile/:email").put(authMiddleware, updateProfile);
router.route("/profile/delete/:id").delete( deleteUserProfile);
router.route("/users/follow").put(authMiddleware, updatefollow);
router.route("/users/get/followers/:userId").get(authMiddleware, getFollowers);
router
  .route("/users/get/followings/:userId")
  .get(authMiddleware, getFollowings);

module.exports = router;
