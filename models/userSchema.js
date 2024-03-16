const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
    },

    fullName: {
      type: String,
      default: "John",
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already in use"],
      validate: [isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must be at least 6 characters"],
    },
    bio: {
      type: String,
      default: "",
    },
    profilePictureURL: {
      type: String,
      default: "",
    },
    dateStamp: {
      type: Date,
      default: Date.now,
    },
    followings: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    createdAt: {
      type: Date,
    },
    lastSignInTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static methods
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new Error("invalid password");
  }
  throw Error("invalid email");
};

// models
const User = mongoose.model("User", userSchema);

module.exports = { User };
