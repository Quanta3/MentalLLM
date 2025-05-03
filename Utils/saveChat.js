// services/chatLogService.js

import ChatLog from '../Models/chatLogs.js';
import evaluateRisk from './evaluateRisk.js'; // adjust path if needed

const saveChatLog = async ({ uuid, userQuery, location, ipAddress }) => {
  const chat = userQuery;
  try {
    if (!uuid || typeof uuid !== 'string') {
      throw new Error('UUID is required');
    }
    if (!chat || typeof chat !== 'string') {
      throw new Error('Chat string is required');
    }

    const existingLog = await ChatLog.findOne({ uuid });

    let updatedChatHistory;
    if (existingLog) {
      // Append to existing chat history
      updatedChatHistory = [...existingLog.chatHistory, chat];
    } else {
      // Create new chat history
      updatedChatHistory = [chat];
    }

    const fullChatForEvaluation = updatedChatHistory.join(' ');
    const suicideRiskPercent = await evaluateRisk(fullChatForEvaluation); // Assume this returns 0-100

    let riskLevel = 'low';
    if (suicideRiskPercent >= 70) riskLevel = 'high';
    else if (suicideRiskPercent >= 40) riskLevel = 'moderate';

    let chatLog;
    if (existingLog) {
      existingLog.chatHistory = updatedChatHistory;
      existingLog.suicideRiskPercent = suicideRiskPercent;
      existingLog.riskLevel = riskLevel;
      if (location) existingLog.location = location;
      if (ipAddress) existingLog.ipAddress = ipAddress; // new handling
      chatLog = await existingLog.save();
    } else {
      chatLog = new ChatLog({
        uuid,
        chatHistory: updatedChatHistory,
        location: location || undefined,
        ipAddress: ipAddress || undefined, // new field
        suicideRiskPercent,
        riskLevel,
      });
      await chatLog.save();
    }

    console.log('Chat log saved/updated successfully');
    return chatLog;
  } catch (error) {
    console.error('Failed to save chat log:', error.message);
    throw error;
  }
};

export default saveChatLog;
