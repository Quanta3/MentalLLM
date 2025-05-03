import User from '../Models/user.js';
import hashPass from '../Utils/hashPass.js';

const register = async (req, res) => {
  const { email, password, district } = req.body;

  try {
    const hashedPassword = await hashPass(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      district
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default  register;
