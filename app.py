import os
import subprocess
from flask import Flask, request, send_file, render_template

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    cue = request.files.get("cuefile")
    binfile = request.files.get("binfile")

    if not cue or not binfile:
        return "Upload both .cue and .bin files."

    cue_path = os.path.join(UPLOAD_FOLDER, cue.filename)
    bin_path = os.path.join(UPLOAD_FOLDER, binfile.filename)

    cue.save(cue_path)
    binfile.save(bin_path)

    chd_path = os.path.join(OUTPUT_FOLDER, cue.filename.replace(".cue", ".chd"))

    subprocess.run([
        "./chdman" if os.name != "nt" else "chdman.exe",
        "createcd",
        "-i", cue_path,
        "-o", chd_path
    ])

    return send_file(chd_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
