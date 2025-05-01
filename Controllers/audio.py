import asyncio
import wave
import sys
import argparse
from pathlib import Path
from google import genai

from dotenv import load_dotenv
import os

load_dotenv()

async def async_enumerate(async_iterator):
    """Helper function to enumerate async iterators"""
    i = 0
    async for item in async_iterator:
        yield i, item
        i += 1

async def main(message):
    # Initialize client
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"), http_options={'api_version': 'v1alpha'})
    model = "gemini-2.0-flash-live-001"
    config = {"response_modalities": ["AUDIO"]}

    # Prepare output directory
    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)
    # Clean existing .wav files
    for wav_file in audio_dir.glob("*.wav"):
        wav_file.unlink()

    # Audio parameters
    nchannels = 1
    sampwidth = 2      # bytes
    framerate = 24000  # samples/sec
    segment_duration = 2  # seconds
    segment_frames = segment_duration * framerate
    segment_bytes = segment_frames * sampwidth * nchannels

    segment_idx = 1
    buffer = b""

    async with client.aio.live.connect(model=model, config=config) as session:
        # Send initial user message
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": message}]},
            turn_complete=True
        )

        # Receive and segment audio
        async for _, response in async_enumerate(session.receive()):
            if response.data:
                buffer += response.data
                # Write out full 2s segments
                while len(buffer) >= segment_bytes:
                    chunk = buffer[:segment_bytes]
                    buffer = buffer[segment_bytes:]

                    out_path = audio_dir / f"audio{segment_idx}.wav"
                    with wave.open(str(out_path), "wb") as wf_seg:
                        wf_seg.setnchannels(nchannels)
                        wf_seg.setsampwidth(sampwidth)
                        wf_seg.setframerate(framerate)
                        wf_seg.writeframes(chunk)
                    print(f"Saved segment: {out_path}")
                    segment_idx += 1

        # Save any remaining audio as a final segment
        if buffer:
            out_path = audio_dir / f"final.wav"
            with wave.open(str(out_path), "wb") as wf_seg:
                wf_seg.setnchannels(nchannels)
                wf_seg.setsampwidth(sampwidth)
                wf_seg.setframerate(framerate)
                wf_seg.writeframes(buffer)
            print(f"Saved final segment: {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate audio response from Gemini in 2s segments")
    parser.add_argument("message", type=str, help="Message to send to Gemini")
    args = parser.parse_args()
    asyncio.run(main(args.message))