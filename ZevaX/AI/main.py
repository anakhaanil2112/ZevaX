import cv2
import numpy as np
import threading
from ultralytics import YOLO
from insightface.app import FaceAnalysis
from numpy.linalg import norm

import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import time

# ---------------- LOAD MODELS ----------------
ppe_model = YOLO("best.pt")

face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1, det_size=(640, 640))

data = np.load("face_embeddings.npz", allow_pickle=True)
known_embeddings = data["embeddings"]
known_names = data["names"]

# -------- FIREBASE SETUP --------
cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://zevax-1234-default-rtdb.firebaseio.com'
})

alerts_ref = db.reference('alerts')
history_ref = db.reference('history')

# ---------------- SETTINGS ----------------
SIM_THRESHOLD = 0.5
FACE_SKIP = 15
PPE_SKIP = 10

last_alert_times = {}  # per employee cooldown
ALERT_COOLDOWN = 60
missing_start_time = {}
MISSING_DELAY = 3  # seconds    # seconds

# ---------------- HELPERS ----------------


def cosine_similarity(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))


def box_overlap(boxA, boxB):
    ax1, ay1, ax2, ay2 = boxA
    bx1, by1, bx2, by2 = boxB
    return not (ax2 < bx1 or ax1 > bx2 or ay2 < by1 or ay1 > by2)


def get_emp_id(person_name):
    try:
        return "emp" + person_name.split("_")[1]
    except:
        return "unknown"

# ---------------- CAMERA ----------------


class VideoStream:
    def __init__(self, src=0):
        self.cap = cv2.VideoCapture(src)
        self.ret, self.frame = self.cap.read()
        self.stopped = False

    def start(self):
        threading.Thread(target=self.update, daemon=True).start()
        return self

    def update(self):
        while not self.stopped:
            self.ret, self.frame = self.cap.read()

    def read(self):
        return self.ret, self.frame

    def stop(self):
        self.stopped = True
        self.cap.release()


vs = VideoStream(0).start()

frame_count = 0
recognized_faces = []
ppe_boxes = []

while True:
    ret, frame = vs.read()
    if not ret:
        break

    frame_count += 1
    small_frame = cv2.resize(frame, (640, 480))

    # -------- FACE --------
    if frame_count % FACE_SKIP == 0:
        faces = face_app.get(small_frame)
        recognized_faces = []

        for face in faces:
            emb = face.embedding
            sims = [cosine_similarity(emb, e) for e in known_embeddings]
            max_sim = max(sims)
            idx = sims.index(max_sim)

            if max_sim > SIM_THRESHOLD:
                name = known_names[idx]
                x1, y1, x2, y2 = map(int, face.bbox)
                recognized_faces.append((x1, y1, x2, y2, name))

    # -------- PPE --------
    if frame_count % PPE_SKIP == 0:
        ppe_results = ppe_model(small_frame, conf=0.4, imgsz=416)[0]
        ppe_boxes = []

        for box in ppe_results.boxes:
            px1, py1, px2, py2 = map(int, box.xyxy[0])
            ppe_box = (px1, py1, px2, py2)

            valid = False
            person_name = ""

            for fx1, fy1, fx2, fy2, name in recognized_faces:
                if box_overlap(ppe_box, (fx1, fy1, fx2, fy2)):
                    valid = True
                    person_name = name
                    break

            if not valid:
                continue

            cls = int(box.cls[0])
            label = ppe_model.names[cls]
            print("Detected label:", label)

            ppe_boxes.append((px1, py1, px2, py2, label, person_name))

    # -------- DRAW + ALERT --------
    for px1, py1, px2, py2, label, person_name in ppe_boxes:

        emp_id = get_emp_id(person_name)
        current_time = time.time()
        last_time = last_alert_times.get(emp_id, 0)

        violations = []

# 🔴 HARDHAT CHECK
        # 🔴 HARDHAT CHECK WITH 10 SEC DELAY
        if "hardhat" not in label.lower():

            key = emp_id + "_hardhat"

            if key not in missing_start_time:
                missing_start_time[key] = time.time()

                elapsed = time.time() - missing_start_time[key]

            violations.append("No hardhat detected")
            print("Sending alert:", emp_id, violations)

        else:
            key = emp_id + "_hardhat"

            if key in missing_start_time:
                del missing_start_time[key]

# 🔴 MASK CHECK
        # 🔴 MASK CHECK WITH 10 SEC DELAY
        if "mask" not in label.lower():

            if emp_id not in missing_start_time:
                missing_start_time[emp_id] = time.time()

            elapsed = time.time() - missing_start_time[emp_id]

            violations.append("No mask detected")
            print("Sending alert:", emp_id, violations)

        else:
            # ✅ MASK FOUND AGAIN
            if emp_id in missing_start_time:
                del missing_start_time[emp_id]

        # 🚨 SEND ALERT
        # 🚨 SEND SEPARATE ALERTS
        if current_time - last_time > ALERT_COOLDOWN:

            for violation in violations:

                alerts_ref.push({
                    "empId": emp_id,
                    "message": violation,
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

        # 🔥 ESP32 ALERT ONLY FOR EMP003
                if emp_id == "emp003":
                    db.reference(f'iot/{emp_id}/alert').set("ppe_violation")
                    print("ESP32 ALERT SENT")

                history_ref.child(emp_id).push({
                    "message": violation,
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

                print(f"{violation} for {emp_id}")

            last_alert_times[emp_id] = current_time

        # 🎨 COLOR
        if "hardhat" in label.lower() and "mask" in label.lower():
            color = (0, 255, 0)
        else:
            color = (0, 0, 255)

        # DRAW
        cv2.rectangle(frame, (px1, py1), (px2, py2), color, 2)
        cv2.putText(frame, f"{person_name} | {label}",
                    (px1, py2 + 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # SHOW
    cv2.imshow("ZEVAX – PPE + FACE", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

vs.stop()
cv2.destroyAllWindows()
