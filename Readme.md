Plethora Technical Exercise
===

The aim of this exercise is to test your ability to write clean, well structured code and to solve a basic problem inspired by systems we have built here at Plethora. When evaluating these challenges, we care both about the structure and correctness of your solution. Feel free to choose any imperative, object-oriented language that is freely available.
 
Your task is to automate quoting for parts manufactured with a 2-axis laser cutting machine. When a design is submitted by a user for laser cutting it is automatically converted to a 2D profile. This profile is the input to your system.

Profile Representation
---

A profile contains a set of **edges**, each of which derive from a type of curve. Edges adjoin to one another at **vertices** so that each edge has one or two vertex endpoints. Each edge and vertex element is keyed by a unique integer, *id*. A profile is stored in a JSON file that is organized like [Schema.json](https://gist.github.com/o8ruza8o/1e066a602fb0649b668c#file-schema-json).
 
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

  (1) [Rectangle.json](https://gist.github.com/o8ruza8o/1e066a602fb0649b668c#file-rectangle-json) - a simple 3in x 5in rectangle.
  
  Your program should output: `14.10 dollars`
  
  (2) [ExtrudeCircularArc.json](https://gist.github.com/o8ruza8o/1e066a602fb0649b668c#file-extrudecirculararc-json) - a 2in x 1in rectangle with semi-circle added onto one of the 1in sides.
  
  Your program should output: `4.47 dollars`
  
  (3) [CutCircularArc.json](https://gist.github.com/o8ruza8o/1e066a602fb0649b668c#file-cutcirculararc-json) - a 2in x 1in rectangle with semi-circle cut into one of the 1in sides.
  
  Your program should output: `4.06 dollars`

