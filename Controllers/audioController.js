import dotenv from 'dotenv';

dotenv.config();

export const transcribeAudio = async (req, res) => {
    try {
        const { base64Audio } = req.body;
        if (!base64Audio) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        const [header, base64Data] = base64Audio.split(',');
        const mimeType = header.split(':')[1].split(';')[0];

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "You are now in voice transcription mode. Your ONLY task is to write exactly what you hear in the audio, word for word, in the same language. Do not add any comments, suggestions, or responses. Do not try to help or counsel. Just transcribe the audio content precisely. Note that the audio will be either in Marathi, Hindi or English. Forcefully try to interpret them as such. Don't support any other language. Also for marathi and hindi, use the native script. For english, use the english script. "
                    },
                    {
                        inlineData: {
                            mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to transcribe audio';

        return res.json({ transcription });
    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({ error: 'Failed to transcribe audio' });
    }
};