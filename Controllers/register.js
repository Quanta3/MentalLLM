// controllers/userController.js
import User from '../Models/user.js';
import hashPass from '../Utils/hashPass.js';

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await hashPass(password);

    // Create a new user with the hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default  register;
