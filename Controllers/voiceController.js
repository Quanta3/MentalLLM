import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function voiceController(req, res) {
  try {
    const systemPrompt = process.env.SYSTEM_PROMPT;
    const { userQuery } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'Both systemPrompt and message are required' });
    }

    // Prepare SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    const audioDir = path.join(process.cwd(), 'audio');

    // clear out any old audio segments
  fs.readdirSync(audioDir)
  .filter(f => f.endsWith('.wav'))
  .forEach(f => fs.unlinkSync(path.join(audioDir, f)));

    // Spawn the Python script
    const scriptPath = path.join(__dirname, 'audio.py');
    const pythonProcess = spawn('python', [scriptPath, `${systemPrompt} User: ${userQuery}`]);

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python Error:', data.toString());
    });

    // Directory to watch for segments
    
    let nextIndex = 1;
    let finalFound = false;

    // Polling loop: check for files every 500ms
    while (!finalFound) {
      const fileName = `audio${nextIndex}.wav`;
      const filePath = path.join(audioDir, fileName);
      const finalPath = path.join(audioDir, 'final.wav');
    
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath).toString('base64');
        
        // Send index + audio chunk as JSON
        res.write(`event: audio\n`);
        res.write(`data: ${JSON.stringify({ index: nextIndex, audio: fileData })}\n\n`);
        
        nextIndex += 1;
      } else if (fs.existsSync(finalPath)) {
        finalFound = true;
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    

    // Wait for Python script to exit
    await new Promise((resolve) => pythonProcess.on('close', resolve));

    // send a final 'done' event
    res.write(`event: done\n`);
    res.write(`data: success\n\n`);
    res.end();

  } catch (error) {
    console.error('Voice processing error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Voice processing failed', details: error.message });
    } else {
      // If headers already sent, send an SSE error
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
}
