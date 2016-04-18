User Guide
===

Please download this repository to a folder on your local machine

run index.html in your preferred browser (the javascript has been tested in Chrome, Firefox, and Microsoft Edge). Note: Jquery must be downloaded, so an internet connection must be available.

The text window will already contain the JSON for the file "ExtrudeCircularArc.json" as an example. The contents of any other JSON file following the template of "schema.json" can be pasted into the textbox and evaluated.

When valid JSON is in the textfield, press the 'calculate cost' button to execute the estimator.

The Estimator
---

The estimator first parses the JSON into data structures for accessing lines, arcs, and points. Dictionary lookups are available so that elements can be accessed by their ids as necessary.

Next, fence points are established for each arc in the part, to ensure that the arcs are accomodated by the base stock. Fence points are the vertices of a polygon with a large number of edges, which forms a boundary for the arc. 

To determine the optimal size of the stock, the array of end points and fence points are rotated through 90 degrees (This takes advantage of the symmetry of rectangles). For each rotation, the optimal bounding box is found. The area of this box is calculated, and if it is the lowest that has been encountered, it is saved, along with the rectangles dimensions. At the end, the area and dimensions of the optimal bounding box are returned. 

The optimal bounding box has the appropriate padding added. To calculate the cost, the area of the box is multiplied by the cost per square inch of material. One note here, is that the optimal bounding box may have an inconveniently precise size for ordering stock, so a future feature may be to add a round-up step, after padding is added.

Next, the program walks through each line segment and arc, and aggregates the total cut time. This is multiplied by the machine cost per second to get the cutting cost.

These values are added together to get the total, then all results are output in the appropriate HTML fields. All output values are rounded to 2 decimal places.

Lastly, there is an animated graphics that shows all the points, including fence points, and the optimal bounding box in green. The graphic shows the 90 degree rotation to determine the optimal bounding box, then switches to the optimal configuration.

Convex Hulls and other improvements
---

One key disadvantage of this algorithm is that it naively includes superfluous points which do not belong to the bounding subset. This may create a performance problem for certain complex part geometries. One solution is to run a convex hull algorithm on the points set after the fence points have been added, which would reduce the number of points to the minimum spanning set which produces the polygon spanning all points. This would dramatically improve performance in cases where the part may have very complex inner geometries, with a relatively simple outer boundary.

Why was a convex hull not used? The geometries of parts considered in this exercise, as well as most 2d parts in general, simply don't contain enough data to make the rotation step computationally stressful. For far more complex parts, and especially 3-dimensional parts, a convex hull step could dramatically limit the data space to only what is needed to generate the bounding shape.

This algorithm adds fencepoints for all arcs, whether they are convex from the part, or concave. This is acceptable for parts with limited complexity, but in the worst case, where a part has many concave arcs, many unnecessary fencepoints will be generated. This is tolerable because fencepoint generation is very fast, but it is still wasteful. To ameliorate this issue, the part geometry could be walked in a clockwise direction beforehand, and only arcs whose 'ClockwiseFrom' point is encountered will have fencepoints generated. This would ensure that no concave arcs are added.

Plethora Technical Exercise
===

The aim of this exercise is to test your ability to write clean, well structured code and to solve a basic problem inspired by systems we have built here at Plethora. When evaluating these challenges, we care both about the structure and correctness of your solution. Feel free to choose any imperative, object-oriented language that is freely available.
 
Your task is to automate quoting for parts manufactured with a 2-axis laser cutting machine. When a design is submitted by a user for laser cutting it is automatically converted to a 2D profile. This profile is the input to your system.

Profile Representation
---

A profile contains a set of **edges**, each of which derive from a type of curve. Edges adjoin to one another at **vertices** so that each edge has one or two vertex endpoints. Each edge and vertex element is keyed by a unique integer, *id*. A profile is stored in a JSON file that is organized like [Schema.json](https://gist.github.com/mrivlin/4bd6f29bedaec07b8e36#file-schema-json).
 
We will consider two types of curve in this exercise: straight line segments and circular arcs. While a line segment is completely defined via its vertices, circular arcs contain the additional *Center* and *ClockwiseFrom* fields. The *ClockwiseFrom* field references the vertex from which the circular arc may be drawn clockwise until it reaches the other vertex of that edge.
 
The units for all curves is inches.

Quoting
---

The main considerations to be taken into account when quoting a part are material costs and machine costs.  
 
Material costs are proportional to the area of stock used for the part with optimal stock orientation. Stock is pre cut into a rectangular shape where, to account for kerf thickness from the laser, additional padding is added to the design's bounds in each dimension to define stock size. 
 
Machine costs are proportional to the time the laser spends cutting. The laser is considered to travel in a straight line at the maximal laser cutting speed, `v_max`, but for a circular arc of nonzero radius, `R`, travels at a speed given by `v_max * exp(-1/R)`.

Task
---

  (1) Write code to deserialize extrusion profiles so that they can be represented in memory.
  
  (2) Write a program that takes a profile and produces a quote. Assume:
  
    - Padding: 0.1in
    
    - Material Cost: $0.75/in^2
    
    - Maximal laser cutter speed: 0.5 in/s
    
    - Machine Time Cost: $0.07/s
  
  (3) Keep all of your progress in a git repository and when you are done, push your repository and send an email letting us know you're done.
  
  (4) Include a brief description of how to use your code, what you would do to improve it if you had more time and any other considerations you think are relevant. Please make sure to reference any external code or libraries used.

Examples
---

The provided examples are given for your convenience and testing. These examples represent a few very simple cases but expect your code to be tested with instances of more complex geometry.

Three example JSON files:

  (1) [Rectangle.json](https://gist.github.com/mrivlin/4bd6f29bedaec07b8e36#file-rectangle-json) - a simple 3in x 5in rectangle.
  
  Your program should output: `14.10 dollars`
  
  (2) [ExtrudeCircularArc.json](https://gist.github.com/mrivlin/4bd6f29bedaec07b8e36#file-extrudecirculararc-json) - a 2in x 1in rectangle with semi-circle added onto one of the 1in sides.
  
  Your program should output: `4.47 dollars`
  
  (3) [CutCircularArc.json](https://gist.github.com/mrivlin/4bd6f29bedaec07b8e36#file-cutcirculararc-json) - a 2in x 1in rectangle with semi-circle cut into one of the 1in sides.
  
  Your program should output: `4.06 dollars`

