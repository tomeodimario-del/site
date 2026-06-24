from flask import Flask, request, jsonify

app = Flask(__name__)

TASK = {}
RESULT = {}

TOKEN = "CHANGE_ME_SECRET"

def auth(req):
    return req.headers.get("Authorization") == TOKEN

@app.route("/task", methods=["GET", "POST"])
def task():
    global TASK

    if request.method == "POST":
        if not auth(request):
            return "unauthorized", 403
        TASK = request.json
        return "ok"

    return jsonify(TASK)

@app.route("/result", methods=["POST"])
def result():
    global RESULT
    if not auth(request):
        return "unauthorized", 403

    RESULT = request.json
    return "ok"

@app.route("/result", methods=["GET"])
def get_result():
    return jsonify(RESULT)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)