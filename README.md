# VoronoiLava
A project that renders lava using voronoi diagrams.

Demo can be found [here](https://davismariotti.com/voronoi/).

### The Goal
* Implement voronoi diagrams
* Use voronoi diagrams to render lava
* Learn about delaunay triangulation
* Lean about HTML5 canvas rendering

### Analysis
First, the delaunay triangulation is calculated. This uses the Bowyer-Watson algorithm which has a worst case of O(N<sup>2</sup>).
Second, the voronoi diagram is calculated from the delaunay triangulation. This has a worst case of O(N).

### Empirical Results
The graph belows shows the amount of milliseconds the algorithm takes to compute the voronoi diagram up to 400 points. The red trendline is a quadratic trendline.
![Empirical Results](/images/empirical.png)

### Challenges
* Having voronoi edges extend beyond the screen
* Writing in Javascript ES6
* Real time canvas rendering
* Debugging geometry issues

### Photos
![Empirical Results](/images/lava.png)
![Empirical Results](/images/sample.png)
