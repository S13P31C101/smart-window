#!/usr/bin/env python3
"""
YouTube Audio Service - yt-dlp based stream extractor

Communicates with Qt application via JSON on stdin/stdout.
Extracts audio stream URLs from YouTube videos using yt-dlp.

Requirements:
    - yt-dlp (pip install yt-dlp)

Protocol:
    Input (stdin):  {"command": "get_stream", "url": "youtube_url"}
                    {"command": "ping"}
                    {"command": "set_cookies", "path": "/path/to/cookies.txt"}

    Output (stdout): {"success": true, "stream_url": "...", "title": "...", "thumbnail": "...", "uploader": "...", "duration": 123}
                     {"success": false, "error": "error message"}
                     {"pong": true}
"""

import sys
import json
import os

try:
    import yt_dlp
except ImportError:
    print(json.dumps({"success": False, "error": "yt-dlp not installed. Install with: pip install yt-dlp"}), flush=True)
    sys.exit(1)


class YouTubeAudioService:
    def __init__(self):
        self.cookies_path = None

    def log(self, message):
        """Log to stderr (Qt reads stderr separately)"""
        print(f"[YouTube Service] {message}", file=sys.stderr, flush=True)

    def get_stream_url(self, youtube_url):
        """
        Extract audio stream URL from YouTube video

        Args:
            youtube_url: YouTube video URL or video ID

        Returns:
            dict: Stream information or error
        """
        try:
            self.log(f"Extracting stream from: {youtube_url}")

            # Configure yt-dlp options
            ydl_opts = {
                'format': 'bestaudio/best',  # Get best audio quality
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'force_generic_extractor': False,
                'noplaylist': True,  # Don't download playlists, only single video
            }

            # Add cookies if provided (for YouTube Premium/age-restricted content)
            if self.cookies_path and os.path.exists(self.cookies_path):
                ydl_opts['cookiefile'] = self.cookies_path
                self.log(f"Using cookies from: {self.cookies_path}")

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract video info
                self.log(f"Calling yt-dlp.extract_info()...")
                info = ydl.extract_info(youtube_url, download=False)
                self.log(f"yt-dlp.extract_info() completed")

                if info is None:
                    self.log(f"ERROR: extract_info() returned None")
                    return {
                        "success": False,
                        "error": "Failed to extract video information"
                    }

                # Get the direct stream URL
                stream_url = info.get('url')

                if not stream_url:
                    # Try to get from requested formats
                    formats = info.get('formats', [])
                    if formats:
                        # Find best audio format
                        audio_formats = [f for f in formats if f.get('acodec') != 'none']
                        if audio_formats:
                            stream_url = audio_formats[0].get('url')

                if not stream_url:
                    return {
                        "success": False,
                        "error": "No stream URL found in video info"
                    }

                # Extract metadata
                title = info.get('title', 'Unknown Title')
                uploader = info.get('uploader', 'Unknown Uploader')
                thumbnail = info.get('thumbnail', '')
                duration = info.get('duration', 0)  # in seconds

                self.log(f"Stream extracted: {title} by {uploader} ({duration}s)")

                return {
                    "success": True,
                    "stream_url": stream_url,
                    "title": title,
                    "uploader": uploader,
                    "thumbnail": thumbnail,
                    "duration": duration
                }

        except yt_dlp.utils.DownloadError as e:
            error_msg = str(e)
            self.log(f"yt-dlp download error: {error_msg}")
            return {
                "success": False,
                "error": f"Download error: {error_msg}"
            }
        except Exception as e:
            error_msg = str(e)
            self.log(f"Unexpected error: {error_msg}")
            return {
                "success": False,
                "error": f"Unexpected error: {error_msg}"
            }

    def handle_command(self, command_data):
        """
        Handle incoming command from Qt application

        Args:
            command_data: dict with command information

        Returns:
            dict: Response to send back
        """
        command = command_data.get("command")

        if command == "ping":
            return {"pong": True}

        elif command == "get_stream":
            url = command_data.get("url")
            if not url:
                return {
                    "success": False,
                    "error": "No URL provided"
                }
            return self.get_stream_url(url)

        elif command == "set_cookies":
            path = command_data.get("path")
            if path and os.path.exists(path):
                self.cookies_path = path
                self.log(f"Cookies path set: {path}")
                return {
                    "success": True,
                    "message": "Cookies path updated"
                }
            else:
                return {
                    "success": False,
                    "error": f"Cookies file not found: {path}"
                }

        else:
            return {
                "success": False,
                "error": f"Unknown command: {command}"
            }

    def run(self):
        """
        Main service loop - read commands from stdin, write responses to stdout
        """
        self.log("YouTube Audio Service started")
        self.log(f"yt-dlp version: {yt_dlp.version.__version__}")

        # Send ready signal
        print(json.dumps({"pong": True}), flush=True)

        try:
            for line in sys.stdin:
                line = line.strip()
                if not line:
                    continue

                try:
                    command_data = json.loads(line)
                    self.log(f"Received command: {command_data.get('command')}")

                    response = self.handle_command(command_data)

                    # Send response as JSON
                    print(json.dumps(response), flush=True)

                except json.JSONDecodeError as e:
                    error_response = {
                        "success": False,
                        "error": f"Invalid JSON: {str(e)}"
                    }
                    print(json.dumps(error_response), flush=True)

        except KeyboardInterrupt:
            self.log("Service interrupted by user")
        except Exception as e:
            self.log(f"Fatal error: {str(e)}")
            sys.exit(1)


if __name__ == "__main__":
    service = YouTubeAudioService()

    # Check if cookies path provided as command line argument
    if len(sys.argv) > 1:
        cookies_path = sys.argv[1]
        if os.path.exists(cookies_path):
            service.cookies_path = cookies_path
            service.log(f"Using cookies from command line: {cookies_path}")
        else:
            service.log(f"Warning: Cookies file not found: {cookies_path}")

    service.run()
