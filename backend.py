import json
from flask import Flask, request, Response
import numpy as np 

from solvers.dp import perform_dp
from solvers.annealing import perform_annealing

app = Flask(__name__)

distances = np.loadtxt("./data/distances.tsv", delimiter="\t")

@app.get("/routes")
def routes():
    N = request.args.get("n", default=10, type=int)
    algorithm = request.args.get("algorithm", default="dp", type=str)
    n_distances = distances[:N, :N]

    if algorithm == "dp":
        cost, perms = perform_dp(n_distances)
        print(cost, perms) 
    elif algorithm == "annealing": 
        best_perm, best_cost, perms, costs = perform_annealing(
            n_distances, alpha=0.99, steps_per_temp=N)

    def stream(perms):
        for perm in perms:
            yield f"data: {json.dumps(perm)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return Response(stream(perms), mimetype="text/event-stream")

app.run(port=5000, threaded=True)