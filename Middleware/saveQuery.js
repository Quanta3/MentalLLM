import saveChat from '../Utils/saveChat.js'
import uuidClass from '../Utils/uuid.js'

const saveQuery = async (req, res, next) => {
  try {
    const uuid = req.body.uuid;
    const userQuery = req.body.userQuery?.toString() || '';

    if (!uuid) {
      return res.status(400).json({ error: 'UUID not provided' });
    }

    uuidClass.updateContext(uuid, userQuery);
    const chat = uuidClass.getContext(uuid);

    console.log(chat)

    if (!chat) {
      return res.status(400).json({ error: 'Invalid UUID or context expired' });
    }

    const location = req.body.location || null;

    await saveChat({ chat, location });

    // Proceed to next middleware/route handler
    next();

  } catch (error) {
    console.error('Error saving chat log:', error.message);
    res.status(500).json({ error: 'Failed to save chat log' });
  }
};

export default saveQuery;
