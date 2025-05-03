import saveChat from '../Utils/saveChat.js'
import uuidClass from '../Utils/uuid.js'

const saveQuery = async (req, res, next) => {
  try {
    const uuid = req.body.uuid;
    const userQuery = req.body.userQuery?.toString() || '';

    if (!uuid) {
      return res.status(400).json({ error: 'UUID not provided' });
    }

    const chat = uuidClass.getContext(uuid);

    uuidClass.updateContext(uuid, userQuery); // Now we know the context exists
    const updatedChat = uuidClass.getContext(uuid);

    
    

    const location = req.body.location || null;

    // Persist only the new message (not full context) in chat log
    await saveChat({ uuid, userQuery, location });

    // Overwrite userQuery to include full context for model input
    req.body.userQuery = updatedChat;

    next();

  } catch (error) {
    console.error('Error saving chat log:', error.message);
    res.status(500).json({ error: 'Failed to save chat log' });
  }
};

export default saveQuery;
