import asyncio
import wave
import sys
import argparse
from google import genai

async def async_enumerate(async_iterator):
    """Helper function to enumerate async iterators"""
    i = 0
    async for item in async_iterator:
        yield i, item
        i += 1

async def main(message):
    client = genai.Client(api_key="", http_options={'api_version': 'v1alpha'})
    model = "gemini-2.0-flash-live-001"
    config = {"response_modalities": ["AUDIO"]}

    async with client.aio.live.connect(model=model, config=config) as session:
        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)

        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": message}]}, turn_complete=True
        )

        async for idx, response in async_enumerate(session.receive()):
            if response.data is not None:
                wf.writeframes(response.data)

            # Un-comment this code to print audio data info
            # if response.server_content.model_turn is not None:
            #     print(response.server_content.model_turn.parts[0].inline_data.mime_type)

        wf.close()
        print(f"Audio response saved to audio.wav")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate audio response from Gemini")
    parser.add_argument("message", type=str, help="Message to send to Gemini")
    args = parser.parse_args()
    
    asyncio.run(main(args.message))