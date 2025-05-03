import { VertexAI } from '@google-cloud/vertexai'

const projectId = 'your-project-id'; // 🔁 Replace with your GCP project ID
const location = 'us-central1';      // Keep this as is unless your model is deployed elsewhere

const vtt = async (audioGcsUri) => {
  const vertexAI = new VertexAI({ project: projectId, location });

  const generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-2.0-flash-001',
  });

  const request = {
    contents: [{
      role: 'user',
      parts: [
        {
          file_data: {
            file_uri: audioGcsUri, // e.g., 'gs://your-bucket/audio.mp3'
            mime_type: 'audio/mpeg',
          },
        },
        {
          text: `Can you transcribe this interview, in the format of timecode, speaker, caption? Use speaker A, speaker B, etc. to identify speakers.`,
        }
      ]
    }]
  };

  try {
    const resp = await generativeModel.generateContent(request);
    const contentResponse = await resp.response;

    const transcription = contentResponse.candidates[0].content.parts[0].text;
    console.log(transcription);

    return transcription;
  } catch (err) {
    console.error('Error during transcription:', err);
    throw err;
  }
};

export default vtt

// Example usage (optional)
// vtt('gs://cloud-samples-data/generative-ai/audio/pixel.mp3');
