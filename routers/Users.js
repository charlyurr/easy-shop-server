const express = require("express");
const { User } = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//this will allow us to pull params from .env file
require("dotenv/config");

// get all users
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

// Get user by ID
router.get(`/:id`, async (req, res) => {
  // Exclude password
  const user = await User.findById(req.params.id).select("-passwordHash");
  // Include specifi fields
  // const user = await User.findById(req.params.id).select("name email phone address");
  if (!user) {
    res.status(500).json({ success: false });
  }
  res.send(user);
});

router.post("/createUser", async (req, res) => {
  // const hashedPassword = await bcrypt.hashSync(req.body.password, 10);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    // isAdmin: req.body.isAdmin,
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) {
    return res.status(500).send("User could not be added");
  } else {
    return res.send(user);
  }
});

//AUTHENTICATE LOGIN AND RETURN JWT TOKEN
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("The user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
});

// Register user
// router.post("/register", async (req, res) => {
//   // const hashedPassword = await bcrypt.hashSync(req.body.password, 10);
//   let user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     passwordHash: bcrypt.hashSync(req.body.password, 10),
//     // isAdmin: req.body.isAdmin,
//     phone: req.body.phone,
//     street: req.body.street,
//     apartment: req.body.apartment,
//     city: req.body.city,
//     zip: req.body.zip,
//     country: req.body.country,
//   });
//   user = await user.save();

//   if (!user) {
//     return res.status(500).send("User could not be added");
//   } else {
//     return res.send(user);
//   }
// });

// Get totatl number of users
router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({ count: userCount });
});

// Delete user
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully!" });
      } else {
        res.status(404).json({ success: false, message: "ID not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
