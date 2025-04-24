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
    const systemPrompt = process.env.SYSTEM_PROMPT
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Both systemPrompt and message are required' });
    }

    // Run the external Python script with arguments
    const scriptPath = path.join(__dirname, 'audio.py');
    const pythonProcess = spawn('python', [scriptPath, systemPrompt+" User :" + message]);

    let errorOutput = '';

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python Error:', data.toString());
    });

    // Wait for the Python script to finish
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`audio.py exited with code ${code}: ${errorOutput}`));
        }
      });
    });

    // Path to generated audio file
    const audioPath = path.join(process.cwd(), 'audio.wav');

    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error('audio.wav was not created by audio.py');
    }

    // Stream the audio file back to the client
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'inline; filename="response.wav"'
    });
    const readStream = fs.createReadStream(audioPath);
    readStream.pipe(res);

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      error: 'Voice processing failed',
      details: error.message
    });
  }
}
