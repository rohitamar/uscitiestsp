# TSP on United States cities

Run `python backend.py`, then open http://localhost:5000.

Enter the number of cities, choose an algorithm, and submit. Tours from the backend are displayed two seconds apart, with their costs. The last tour is labeled "Final tour". Submitting again replaces the current playback.

Dynamic programming is limited to 16 cities. Simulated annealing supports the full dataset. Keep `cities.tsv` and `distances.tsv` in `data/`, in matching city order.
