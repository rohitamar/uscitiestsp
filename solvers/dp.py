from functools import cache 
import math 
import numpy as np 
import numpy.typing as npt 

def perform_dp(dist_matrix: npt.NDArray) -> tuple[float, list[int]]:

    N = dist_matrix.shape[0]

    dp = np.full((1 << N, N), np.inf)
    dp[1, 0] = 0
    
    for i in range(1 << N):
        for j in range(N):
            for k in range(N):
                extra_dist = dist_matrix[j, 0] if i == (1 << N) - 1 else 0
                if j != k and (i >> j) & 1 == 1 and (i >> k) & 1 == 1:
                    dp[i, j] = min(dp[i, j], dp[i ^ (1 << j), k] + dist_matrix[k, j] + extra_dist)

    visited = (1 << N) - 1
    st = int(np.argmin(dp[(1 << N) - 1]))

    ind = st
    path = []
    while ind != 0:
        extra = dist_matrix[st, 0] if visited == (1 << N) - 1 else 0
        visited ^= 1 << ind
        path.append(ind) 

        for j in range(N):
            if (visited >> j) & 1 == 1:
                if dp[visited, j] + dist_matrix[j, ind] + extra == dp[visited | (1 << ind), ind]:
                    ind = j
                    break 

    path.append(0)

    return dp[(1 << N) - 1, st], [path] 
            