const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// helper to remove password from response
const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    number: user.number,
  };
};

const signup = async (req, res) => {
  try {
    const { email, name, number, password } = req.body;

    if (!email || !name || !number || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      email,
      name,
      number,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { signup, login };