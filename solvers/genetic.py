from heapq import nsmallest 
import numpy as np
import numpy.typing as npt 
import random 

from .utils import tour_length, two_opt_neighbor

def select_best(population, fitness, k=10):
    return [p for p, _ in nsmallest(k, zip(population, fitness), key=lambda x : x[1])]

def select_parent(population, fitness):
    """
    This is called tournament selection. 
    Randomly pick k people from the population. 
    Then, for the best (by fitness), pick them with probability p, 
    2nd best with p * (1 - p), third best with p * (1 - p) ^2, and so on.
    I've done p=1 to keep it simple, meaning the best person always goes.
    If p=0.7-0.99, then we are okay someone else going. 

    Alternatively, we can do fitness-normalized sampling. 
    Take the fitness of each person, normalize it into a distribution, sample.  
    """

    candidates = random.sample(range(len(population)), k=min(3, len(population)))
    return population[min(candidates, key=lambda i: fitness[i])]

def crossover(parent1, parent2, dist_matrix):
    """
    Take both tours we have right now. 
    Build a set of vertices that we could go from each vertex.
    Start at a random node. Pick the node with the lowest weight to go to. 
    Do that till the end. New tour.
    The idea here is that TSP candidates will usually repeat edges (other crossovers will also follow this)
    So, for two candidates, we should try to use the same edges in the best way possible. 
    """
    N = len(parent1)
    def build_adj(parent1, parent2):
        adj = [set() for _ in range(N)]
        for parent in [parent1, parent2]:
            for i in range(N):
                adj[parent[i]].add(parent[(i + 1) % N])
                adj[parent[(i + 1) % N]].add(parent[i])

        return adj 

    adj = build_adj(parent1, parent2)

    rng = np.random.default_rng()
    path = [int(rng.integers(low=0, high=N))]
    left = set(range(0, N))
    left.remove(path[0])

    while len(path) < N:
        cur = path[-1]
        possible = adj[cur] & left 
        if not possible:
            possible = left
        
        nxt = min(possible, key=lambda x : dist_matrix[cur][x])

        path.append(nxt)
        left.remove(nxt)

    return np.asarray(path, dtype=int)

def perform_genetic(dist_matrix, pop_size, num_generations):
    N = dist_matrix.shape[0]

    rng = np.random.default_rng()
    population = [rng.permutation(N) for _ in range(pop_size)]
    perms, costs = [], []

    for generation in range(num_generations + 1):
        fitness = [tour_length(x, dist_matrix) for x in population]

        best_idx = int(np.argmin(fitness))
        perms.append(population[best_idx].tolist())
        costs.append(float(fitness[best_idx]))

        if generation == num_generations:
            break

        next_population = select_best(population, fitness, k=min(10, max(1, pop_size // 10)))

        while len(next_population) < pop_size:
            parent1 = select_parent(population, fitness)
            parent2 = select_parent(population, fitness)

            child = crossover(parent1, parent2, dist_matrix)
            # randomly pick a two-opt neighbor, mutate
            child = two_opt_neighbor(child) # mutation

            next_population.append(child)

        population = next_population

    return perms, costs
