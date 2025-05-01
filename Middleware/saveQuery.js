import saveChat from '../Utils/saveChat.js'

const saveQuery = async (req, res, next)=>{
    try {
        const chat = req.body.userQuery?.toString();
        const location = req.body.location || null; // Optional location
    
        if (!chat) {
          return res.status(400).json({ error: 'Chat content is required' });
        }
    
        await saveChat({ chat, location });

        
      } catch (error) {
        console.error('Error saving chat log:', error.message);
        res.status(500).json({ error: 'Failed to save chat log' });
      }
    next()
}


export default saveQuery