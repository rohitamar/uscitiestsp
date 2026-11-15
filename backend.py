import json
from pathlib import Path
from flask import Flask, request, Response, send_from_directory
import numpy as np 

from solvers.dp import perform_dp
from solvers.annealing import perform_annealing

app = Flask(__name__)
root = Path(__file__).resolve().parent

distances = np.loadtxt(root / "data" / "distances.tsv", delimiter="\t")

@app.get("/")
def index():
    return send_from_directory(root, "index.html")

@app.get("/<filename>")
def assets(filename):
    if filename == "cities.tsv":
        return send_from_directory(root / "data", filename)
    if filename in {"app.js", "projection.js", "style.css", "us-map.svg"}:
        return send_from_directory(root, filename)
    return {"error": "Not found."}, 404

@app.get("/routes")
def routes():
    N = request.args.get("n", default=10, type=int)
    algorithm = request.args.get("algorithm", default="dp", type=str)
    n_distances = distances[:N, :N]

    if N <= 2:
        perms = [list(range(N))]
    elif algorithm == "dp":
        perms, costs = perform_dp(n_distances)
    elif algorithm == "annealing": 
        perms, costs = perform_annealing(n_distances, alpha=0.99, steps_per_temp=N)

    def stream(perms):
        for cost, perm in zip(costs, perms):
            tour = {"permutation": perm, "cost": cost, "final": index == len(perms) - 1}
            yield f"data: {json.dumps(tour)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return Response(stream(perms), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(port=5000, threaded=True)
