import ChatLog from '../Models/chatLogs.js';

/**
 * Get all chat logs from the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with all chat logs or error message
 */
export const getAllChatLogs = async (req, res) => {
  try {
    const chatLogs = await ChatLog.find({}).sort({ timestamp: -1 });
    return res.status(200).json({
      success: true,
      count: chatLogs.length,
      data: chatLogs
    });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chat logs',
      error: error.message
    });
  }
};

/**
 * Get chat logs filtered by risk level
 * @param {Object} req - Express request object with riskLevel query parameter
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with filtered chat logs or error message
 */
export const getChatLogsByRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.query;
    
    if (!riskLevel || !['low', 'moderate', 'high'].includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Valid risk level (low, moderate, high) is required'
      });
    }
    
    const chatLogs = await ChatLog.find({ riskLevel }).sort({ timestamp: -1 });
    return res.status(200).json({
      success: true,
      count: chatLogs.length,
      data: chatLogs
    });
  } catch (error) {
    console.error('Error fetching chat logs by risk level:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chat logs',
      error: error.message
    });
  }
};

export default {
  getAllChatLogs,
  getChatLogsByRiskLevel
};