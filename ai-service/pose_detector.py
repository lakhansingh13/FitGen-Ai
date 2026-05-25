import cv2
import mediapipe as mp
import math
import os
import urllib.request

class PoseDetector:
    def __init__(self):
        # Local model configuration
        self.model_path = "pose_landmarker.task"
        if not os.path.exists(self.model_path):
            print("Downloading MediaPipe Pose Model...")
            url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
            urllib.request.urlretrieve(url, self.model_path)
            print("Model downloaded successfully.")

        # Initialize landmarker options
        BaseOptions = mp.tasks.BaseOptions
        self.PoseLandmarker = mp.tasks.vision.PoseLandmarker
        PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=self.model_path),
            running_mode=VisionRunningMode.IMAGE
        )
        self.landmarker = self.PoseLandmarker.create_from_options(options)

        # Visual theme styling colors (BGR format for OpenCV)
        self.neon_green = (20, 255, 57)  # Accents
        self.neon_blue = (255, 240, 0)   # Joint highlights

        # Standard MediaPipe skeleton indices mapping
        self.connections = [
            (11, 12),  # Shoulders
            (11, 13), (13, 15),  # Left Arm
            (12, 14), (14, 16),  # Right Arm
            (11, 23), (12, 24), (23, 24),  # Hips & spine
            (23, 25), (25, 27),  # Left Leg
            (24, 26), (26, 28)   # Right Leg
        ]

        # Exercise rep-counters state trackers
        self.state_tracker = {
            'squat': {
                'stage': 'up',
                'reps': 0,
                'min_angle': 180.0
            },
            'pushup': {
                'stage': 'up',
                'reps': 0,
                'min_angle': 180.0
            }
        }

    def reset_tracker(self):
        for exercise in self.state_tracker:
            self.state_tracker[exercise]['stage'] = 'up'
            self.state_tracker[exercise]['reps'] = 0
            self.state_tracker[exercise]['min_angle'] = 180.0

    def calculate_angle(self, a, b, c):
        """Calculate B-vertex angle from coordinate points A, B, C."""
        ax, ay = a[0], a[1]
        bx, by = b[0], b[1]
        cx, cy = c[0], c[1]
        
        v1 = (ax - bx, ay - by)
        v2 = (cx - bx, cy - by)
        
        dot = v1[0] * v2[0] + v1[1] * v2[1]
        mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
        mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
        
        if mag1 * mag2 == 0:
            return 180.0
            
        cos_angle = dot / (mag1 * mag2)
        cos_angle = max(-1.0, min(1.0, cos_angle))
        
        angle = math.degrees(math.acos(cos_angle))
        return angle

    def process_frame(self, frame, exercise_type='squat'):
        """Processes OpenCV frame, counts reps, checks posture, and overlays custom drawings."""
        h, w, c = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert OpenCV frame to MediaPipe Tasks Image format
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = self.landmarker.detect(mp_image)

        feedback = []
        status = "No person detected"
        reps_count = self.state_tracker[exercise_type]['reps']

        if result.pose_landmarks and len(result.pose_landmarks) > 0:
            status = "Good Position"
            landmarks = result.pose_landmarks[0]
            
            # Map indices to pixel positions
            coords = {}
            required_indices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
            for idx in required_indices:
                if idx < len(landmarks):
                    landmark = landmarks[idx]
                    coords[idx] = (int(landmark.x * w), int(landmark.y * h))

            # Draw skeleton connections manually
            for start_idx, end_idx in self.connections:
                if start_idx in coords and end_idx in coords:
                    p1 = coords[start_idx]
                    p2 = coords[end_idx]
                    cv2.line(frame, p1, p2, self.neon_green, 2)

            # Draw joint keypoints manually
            for idx, pt in coords.items():
                cv2.circle(frame, pt, 5, self.neon_blue, -1)

            # Determine side profile based on leg visibility
            left_knee_vis = landmarks[25].visibility if len(landmarks) > 25 else 0.0
            right_knee_vis = landmarks[26].visibility if len(landmarks) > 26 else 0.0
            side = 'left' if left_knee_vis > right_knee_vis else 'right'

            # Extract active profile joints
            if side == 'left' and all(k in coords for k in [11, 13, 15, 23, 25, 27]):
                shoulder = coords[11]
                elbow = coords[13]
                wrist = coords[15]
                hip = coords[23]
                knee = coords[25]
                ankle = coords[27]
            elif side == 'right' and all(k in coords for k in [12, 14, 16, 24, 26, 28]):
                shoulder = coords[12]
                elbow = coords[14]
                wrist = coords[16]
                hip = coords[24]
                knee = coords[26]
                ankle = coords[28]
            else:
                feedback.append("Adjust position to see full profile.")
                return frame, reps_count, feedback, "Profile blocked"

            tracker = self.state_tracker[exercise_type]

            if exercise_type == 'squat':
                knee_angle = self.calculate_angle(hip, knee, ankle)
                back_angle = self.calculate_angle(shoulder, hip, knee)
                
                # Render angle details on joint vertex
                cv2.putText(frame, f"{int(knee_angle)} deg", (knee[0] + 15, knee[1]), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.neon_blue, 2)
                
                if back_angle < 135:
                    feedback.append("Keep your back straight!")
                    status = "Correction needed"
                
                if knee_angle < tracker['min_angle']:
                    tracker['min_angle'] = knee_angle
                    
                if knee_angle < 100:
                    if tracker['stage'] == 'up':
                        tracker['stage'] = 'down'
                elif knee_angle > 155:
                    if tracker['stage'] == 'down':
                        if tracker['min_angle'] > 105:
                            feedback.append("Squat deeper next rep!")
                        else:
                            feedback.append("Good squat depth!")
                            
                        tracker['reps'] += 1
                        tracker['stage'] = 'up'
                        tracker['min_angle'] = 180.0
                
                if tracker['stage'] == 'down':
                    feedback.append("Going down... Hold core tight!")
                else:
                    feedback.append("Drive up through your heels!")

            elif exercise_type == 'pushup':
                elbow_angle = self.calculate_angle(shoulder, elbow, wrist)
                hip_angle = self.calculate_angle(shoulder, hip, ankle)
                
                cv2.putText(frame, f"{int(elbow_angle)} deg", (elbow[0] + 15, elbow[1]), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.neon_blue, 2)
                
                if hip_angle < 155:
                    feedback.append("Keep your body and hips straight!")
                    status = "Correction needed"
                
                if elbow_angle < tracker['min_angle']:
                    tracker['min_angle'] = elbow_angle
                    
                if elbow_angle < 95:
                    if tracker['stage'] == 'up':
                        tracker['stage'] = 'down'
                elif elbow_angle > 150:
                    if tracker['stage'] == 'down':
                        if tracker['min_angle'] > 100:
                            feedback.append("Lower your body more next rep!")
                        else:
                            feedback.append("Excellent pushup depth!")
                        
                        tracker['reps'] += 1
                        tracker['stage'] = 'up'
                        tracker['min_angle'] = 180.0
                
                if tracker['stage'] == 'down':
                    feedback.append("Lowering body... Squeeze glutes!")
                else:
                    feedback.append("Push the floor away!")
            
            reps_count = tracker['reps']
            
        else:
            feedback.append("Align yourself in camera frame.")

        return frame, reps_count, feedback, status
