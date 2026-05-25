import base64
import json
import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pose_detector import PoseDetector

app = FastAPI(title="FitGen AI Pose detection microservice")

# Enable CORS for Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = PoseDetector()

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "FitGen AI Posture Service",
        "endpoints": ["/pose [WebSocket]"]
    }

@app.websocket("/pose")
async def pose_socket(websocket: WebSocket):
    await websocket.accept()
    detector.reset_tracker()
    print("New websocket connection accepted.")
    
    try:
        while True:
            # Receive payload
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            base64_image = payload.get("image")
            exercise_type = payload.get("exercise", "squat")
            
            if not base64_image:
                continue
                
            # Convert base64 to byte string and decode to cv2 image
            img_bytes = base64.b64decode(base64_image)
            np_arr = np.frombuffer(img_bytes, dtype=np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                continue
                
            # Process body landmarks
            annotated_frame, reps_count, feedback_list, form_status = detector.process_frame(frame, exercise_type)
            
            # Encode frame back to JPEG and convert to base64
            _, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
            encoded_img = base64.b64encode(buffer).decode('utf-8')
            
            # Send results back
            response = {
                "image": encoded_img,
                "reps": reps_count,
                "feedback": feedback_list,
                "status": form_status
            }
            await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
    except Exception as e:
        print(f"Connection closed due to error: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
