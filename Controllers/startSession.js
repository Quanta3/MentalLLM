import uuid from '../Utils/uuid.js';
import ChatLog from '../Models/chatLogs.js';

const startSession = async (req, res) => {
  try {
    const { ipAddress, latitude, longitude, city } = req.body;

    if (latitude === undefined || longitude === undefined || !city) {
      return res.status(400).json({ error: 'Latitude, longitude, and city are required' });
    }

    const userContext = "";
    const contextId = uuid.createContext(userContext); // Or just uuid.v4() if that's what you're using

    const newChatLog = new ChatLog({
      ipAddress,
      uuid: contextId,
      chatHistory: [],
      location: { latitude, longitude, city },
      suicideRiskPercent: 0,
      riskLevel: 'normal',
    });

    await newChatLog.save();

    res.status(201).json({ contextId });
  } catch (error) {
    console.error('Failed to start session:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default startSession;
