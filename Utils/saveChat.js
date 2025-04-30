// services/chatLogService.js

import ChatLog from '../Models/chatLogs.js';
import evaluateRisk from './evaluateRisk.js'; // adjust path if needed

const saveChatLog = async ({ chat, location }) => {
  try {
    if (!chat || typeof chat !== 'string') {
      throw new Error('Chat string is required');
    }

    const suicideRiskPercent = await evaluateRisk(chat); // Assume this returns 0-100

    let riskLevel = 'low';
    if (suicideRiskPercent >= 70) riskLevel = 'high';
    else if (suicideRiskPercent >= 40) riskLevel = 'moderate';

    const chatLog = new ChatLog({
      chatHistory: chat,
      location: location || undefined,
      suicideRiskPercent,
      riskLevel,
    });

    await chatLog.save();
    console.log('Chat log saved successfully');
    return chatLog;
  } catch (error) {
    console.error('Failed to save chat log:', error.message);
    throw error;
  }
};

export default saveChatLog;
