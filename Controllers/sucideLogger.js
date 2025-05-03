import ChatLog from '../Models/chatLogs.js';

const sucideLogger = async (req, res) => {
  try {
    const { riskLevel, city } = req.body;
    const filter = {};
    if (riskLevel && ['low', 'moderate', 'high'].includes(riskLevel)) {
      filter.riskLevel = riskLevel;
    }
    if (city && city.toLowerCase() !== 'all') {
      filter['location.city'] = { $regex: new RegExp(city, 'i') }; 
    }
    const logs = await ChatLog.find(filter).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export default sucideLogger;
