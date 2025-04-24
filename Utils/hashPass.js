// utils/hashPass.js
import bcrypt from 'bcryptjs';

const hashPass = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

export default hashPass;
