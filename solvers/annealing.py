import math 
import numpy as np 
import numpy.typing as npt 

from utils import tour_length, two_opt_neighbor

def find_initial_temp(N, dist_matrix):
    """
    Find the initial temperature such that the probability of 
    choosing a solution that is worse than the current
    solution is 0.8.
    """
    rng = np.random.default_rng()
    current = rng.permutation(N)
    current_cost = tour_length(current, dist_matrix)
    avg_cost = 0.0
    cnt = 0

    while cnt < 750:
        candidate = two_opt_neighbor(current)
        candidate_cost = tour_length(candidate, dist_matrix)

        delta = candidate_cost - current_cost 
        if delta > 0:
            cnt += 1
            avg_cost += delta 

    return -(avg_cost / cnt) / math.log(0.8) if cnt else 1.0

def perform_annealing(dist_matrix, alpha, steps_per_temp):
    N = dist_matrix.shape[0]

    rng = np.random.default_rng()
    current = rng.permutation(N)
    current_cost = tour_length(current, dist_matrix)

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

        temp = temp * alpha 

    return perms, costs 
