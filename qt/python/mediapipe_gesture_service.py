#!/usr/bin/env python3
"""
MediaPipe Gesture Recognition Service for Lumiscape

This service uses MediaPipe to detect hand gestures from webcam
and outputs gesture data as JSON to stdout for Qt application to consume.

Output format:
{
    "nx": 0.5,           # Normalized X position (0.0-1.0)
    "ny": 0.5,           # Normalized Y position (0.0-1.0)
    "gesture": "point",  # Detected gesture name
    "confidence": 0.95   # Detection confidence (0.0-1.0)
}
"""

import sys
import json
import time
import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Optional, Tuple

class GestureRecognitionService:
    """MediaPipe-based gesture recognition service"""

    def __init__(self, camera_id: int = 2):
        """
        Initialize gesture recognition service

        Args:
            camera_id: Camera device ID (default: 0)
        """
        self.camera_id = camera_id

        # Initialize MediaPipe Hands
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )

        self.mp_drawing = mp.solutions.drawing_utils

        # Initialize camera
        self.cap = None

        # State tracking
        self.last_gesture = None
        self.last_position = (0.5, 0.5)

        # Gesture detection parameters
        self.fist_threshold = 0.3
        self.pointing_threshold = 0.7

    def initialize_camera(self) -> bool:
        """Initialize camera capture"""
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                self.log_error("Failed to open camera")
                return False

            # Set camera properties for better performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)

            self.log_info("Camera initialized successfully")
            return True

        except Exception as e:
            self.log_error(f"Camera initialization error: {e}")
            return False

    def detect_gesture(self, hand_landmarks) -> Tuple[str, float]:
        """
        Detect gesture from hand landmarks

        Args:
            hand_landmarks: MediaPipe hand landmarks

        Returns:
            Tuple of (gesture_name, confidence)
        """
        # Get landmark positions
        landmarks = hand_landmarks.landmark

        # Calculate finger states (extended or folded)
        thumb_extended = self.is_thumb_extended(landmarks)
        index_extended = self.is_finger_extended(landmarks, 8, 6)
        middle_extended = self.is_finger_extended(landmarks, 12, 10)
        ring_extended = self.is_finger_extended(landmarks, 16, 14)
        pinky_extended = self.is_finger_extended(landmarks, 20, 18)

        # Count extended fingers
        extended_count = sum([
            thumb_extended,
            index_extended,
            middle_extended,
            ring_extended,
            pinky_extended
        ])

        # Gesture classification
        confidence = 0.9

        # Fist (all fingers folded)
        if extended_count == 0:
            return "fist", confidence

        # Open palm (all fingers extended)
        elif extended_count == 5:
            return "open_palm", confidence

        # Pointing (only index finger extended)
        elif index_extended and extended_count == 1:
            return "pointing", confidence

        # Peace sign (index and middle extended)
        elif index_extended and middle_extended and extended_count == 2:
            return "peace", confidence

        # Thumbs up
        elif thumb_extended and extended_count == 1:
            return "thumbs_up", confidence

        # Unknown gesture
        else:
            return "unknown", 0.5

    def is_finger_extended(self, landmarks, tip_id: int, pip_id: int) -> bool:
        """Check if finger is extended"""
        tip = landmarks[tip_id]
        pip = landmarks[pip_id]
        return tip.y < pip.y

    def is_thumb_extended(self, landmarks) -> bool:
        """Check if thumb is extended (special case)"""
        thumb_tip = landmarks[4]
        thumb_mcp = landmarks[2]
        return thumb_tip.x > thumb_mcp.x

    def get_hand_center(self, hand_landmarks) -> Tuple[float, float]:
        """
        Get normalized center position of hand (palm center)

        Returns:
            Tuple of (nx, ny) in range 0.0-1.0
        """
        landmarks = hand_landmarks.landmark

        # Use palm center for stable cursor position
        # Palm center = average of wrist and middle finger MCP
        wrist = landmarks[0]           # 손목
        middle_mcp = landmarks[9]      # 중지 손바닥 관절

        # Calculate palm center
        palm_x = (wrist.x + middle_mcp.x) / 2
        palm_y = (wrist.y + middle_mcp.y) / 2

        # Normalize coordinates (MediaPipe already provides normalized coords)
        nx = palm_x
        ny = palm_y

        # Clamp to valid range
        nx = max(0.0, min(1.0, nx))
        ny = max(0.0, min(1.0, ny))

        return nx, ny

    def process_frame(self) -> Optional[Dict]:
        """
        Process single frame and detect gestures

        Returns:
            Dictionary with gesture data or None
        """
        ret, frame = self.cap.read()
        if not ret:
            return None

        # Flip frame horizontally for natural interaction
        frame = cv2.flip(frame, 1)

        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process frame with MediaPipe
        results = self.hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            # Process first detected hand
            hand_landmarks = results.multi_hand_landmarks[0]

            # Get hand position
            nx, ny = self.get_hand_center(hand_landmarks)

            # Detect gesture
            gesture, confidence = self.detect_gesture(hand_landmarks)

            # Update state
            self.last_gesture = gesture
            self.last_position = (nx, ny)

            return {
                "nx": nx,
                "ny": ny,
                "gesture": gesture,
                "confidence": confidence
            }
        else:
            # No hand detected
            return {
                "nx": self.last_position[0],
                "ny": self.last_position[1],
                "gesture": "none",
                "confidence": 0.0
            }

    def output_gesture_data(self, data: Dict):
        """
        Output gesture data as JSON to stdout

        Args:
            data: Gesture data dictionary
        """
        json_str = json.dumps(data)
        print(json_str, flush=True)

    def log_info(self, message: str):
        """Log info message to stderr"""
        print(f"[INFO] {message}", file=sys.stderr, flush=True)

    def log_error(self, message: str):
        """Log error message to stderr"""
        print(f"[ERROR] {message}", file=sys.stderr, flush=True)

    def run(self):
        """Main service loop"""
        self.log_info("Starting MediaPipe Gesture Recognition Service")

        if not self.initialize_camera():
            self.log_error("Failed to initialize camera")
            sys.exit(1)

        self.log_info("Service started successfully")

        try:
            while True:
                # Process frame
                gesture_data = self.process_frame()

                if gesture_data:
                    # Output to stdout
                    self.output_gesture_data(gesture_data)

                # Small delay to prevent CPU overload
                time.sleep(0.033)  # ~30 FPS

        except KeyboardInterrupt:
            self.log_info("Service stopped by user")

        except Exception as e:
            self.log_error(f"Unexpected error: {e}")

        finally:
            self.cleanup()

    def cleanup(self):
        """Cleanup resources"""
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()
        self.log_info("Resources cleaned up")


def main():
    """Main entry point"""
    # Parse command line arguments (optional)
    camera_id = 0
    if len(sys.argv) > 1:
        try:
            camera_id = int(sys.argv[1])
        except ValueError:
            print("Invalid camera ID, using default (0)", file=sys.stderr)

    # Create and run service
    service = GestureRecognitionService(camera_id=camera_id)
    service.run()


if __name__ == "__main__":
    main()
