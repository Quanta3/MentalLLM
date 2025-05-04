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

    // Baseline is 50%
    // Below 50% is normal
    let riskLevel = 'normal';
    if (suicideRiskPercent >= 80) riskLevel = 'high';
    else if (suicideRiskPercent >= 65) riskLevel = 'moderate';
    else if (suicideRiskPercent >= 50) riskLevel = 'low';
    // Below 50% remains 'normal'

    let chatLog;
    if (existingLog) {
      existingLog.chatHistory = updatedChatHistory;
      existingLog.suicideRiskPercent = suicideRiskPercent;
      existingLog.riskLevel = riskLevel;
      if (location) existingLog.location = location;
      
      // Only update ipAddress if it's provided and not null/undefined/empty string
      // This preserves the original IP address from being overwritten
      if (ipAddress && ipAddress !== '::1') {
        existingLog.ipAddress = ipAddress;
      }
      
      chatLog = await existingLog.save();
    } else {
      chatLog = new ChatLog({
        uuid,
        chatHistory: updatedChatHistory,
        location: location || undefined,
        ipAddress: ipAddress && ipAddress !== '::1' ? ipAddress : undefined, // Don't save ::1
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
