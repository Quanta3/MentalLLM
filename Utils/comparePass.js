// utils/comparePass.js
import bcrypt from 'bcryptjs';

const comparePass = async (enteredPassword, storedHashedPassword) => {
  try {
    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
    return isMatch; // Returns true if passwords match, false otherwise
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

export default comparePass;
