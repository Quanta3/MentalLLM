import ChatLog from '../Models/chatLogs.js';

const sucideLogger = async (req, res) => {
  try {
    const { riskLevel, district } = req.body;

    // Build dynamic MongoDB filter
    const filter = {};

    // Apply risk level filter only if a valid one is provided
    if (riskLevel && ['low', 'moderate', 'high'].includes(riskLevel)) {
      filter.riskLevel = riskLevel;
    }

    // Apply location filter only if district is provided
    if (district && district.toLowerCase() !== 'all') {
      filter['location.city'] = { $regex: new RegExp(district, 'i') }; // case-insensitive match
    }

    // Query filtered chat logs, latest first
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
