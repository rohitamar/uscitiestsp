import numpy as np

def tour_length(tour, dist_matrix) -> float:
    dist, N = 0, tour.shape[0]
    for i in range(len(tour)):
        dist += dist_matrix[tour[i]][tour[(i + 1) % N]]
    return dist 

def two_opt_neighbor(tour):
    candidate = tour.copy()
    N = candidate.shape[0]
    rng = np.random.default_rng()
    i, j = np.sort(rng.choice(np.arange(1, N), size=2, replace=False))
    candidate[i:j + 1] = candidate[i:j + 1][::-1]
    return candidate 