// controllers/login.js
import jwt from 'jsonwebtoken';
import User from '../Models/user.js';
import comparePass from '../Utils/comparePass.js';

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Step 2: Compare entered password with stored hashed password
    const isMatch = await comparePass(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Step 3: Generate JWT Token
    const payload = {
      userId: user._id,
      username: user.username,
    };

    // Generate token with a secret key, set the expiration time to 1 hour
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Step 4: Send the token in the response
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

export default login;
