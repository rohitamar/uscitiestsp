import math 
import numpy as np 
import numpy.typing as npt 

def two_opt_neighbor(tour):
    candidate = tour.copy()
    N = candidate.shape[0]
    rng = np.random.default_rng()
    i, j = np.sort(rng.choice(np.arange(1, N), size=2, replace=False))
    candidate[i:j + 1] = candidate[i:j + 1][::-1]
    return candidate 

def tour_length(tour, dist_matrix) -> float:
    dist, N = 0, tour.shape[0]
    for i in range(len(tour)):
        dist += dist_matrix[tour[i]][tour[(i + 1) % N]]
    return dist 

def find_initial_temp(N, dist_matrix):
    rng = np.random.default_rng()
    current = rng.permutation(N)
    current_cost = tour_length(current, dist_matrix)
    avg_cost = 0.0
    cnt = 0

    while cnt < 500:
        candidate = two_opt_neighbor(current)
        candidate_cost = tour_length(candidate, dist_matrix)

        delta = candidate_cost - current_cost 
        if delta > 0:
            cnt += 1
            avg_cost += delta 

    return avg_cost / cnt

def perform_annealing(dist_matrix, alpha, steps_per_temp):
    N = dist_matrix.shape[0]

    rng = np.random.default_rng()
    current = rng.permutation(N)
    current_cost = tour_length(current, dist_matrix)

    best = current.copy()
    best_cost = current_cost 

    perms = [current.tolist()]
    costs = [current_cost]

    temp = find_initial_temp(N, dist_matrix)
    min_temp = temp * 0.001
    while temp > min_temp:
        for _ in range(steps_per_temp):
            candidate = two_opt_neighbor(current)
            candidate_cost = tour_length(candidate, dist_matrix)

            delta = candidate_cost - current_cost 
            if delta <= 0 or rng.random() < math.exp(-delta / temp):
                current = candidate 
                current_cost = candidate_cost 

                if current_cost < costs[-1]:
                    costs.append(current_cost)
                    perms.append(current.copy().tolist())

                if current_cost < best_cost: 
                    best_cost = current_cost 
                    best = current.copy()

        temp = temp * alpha 

    return best, best_cost, perms, costs 
