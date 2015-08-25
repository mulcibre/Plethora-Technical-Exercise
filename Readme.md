Plethora Technical Exercise
===

This exercise may be done in an imperative object orientated language of your choosing. The aim of this exercise is to test your ability to write clean, well structured code. 
 
Imagine you are given the task of automating the quoting for parts to be made with a 2 axis laser cutting machine. When a user submits their 3D part, it automatically gets converted to a 2D object which represents the profile of the extrusion. 

Profile Representation
---

A profile contains a set of *edges*, each of which derive from a type of curve. Edges adjoin to one another at *vertices* so that each edge has one or two vertex endpoints. Each edge and vertex element is keyed by a unique integer, *id*. A profile is stored in a JSON file that is organized like Schema.json below.
 
We will consider two types of curve in this exercise, straight line segments and circular arcs. While a line segment is completely defined via its vertices, circular arcs contain the additional *Center* and *ClockwiseFrom* fields. The *ClockwiseFrom* field references the vertex from which the circular arc may be drawn clockwise until it reaches the other vertex for that edge.
 
All units are in inches.

Quoting
---

Main considerations that should be taken into account when quoting a part are material costs and machine cost.  
 
Material costs are proportional to the area of stock used. Stock is pre cut into rectangular shape where, to consider kerf thickness from the laser, additional padding is added to the design bounds in each direction to define stock size. 
 
Machine costs are proportional to the time laser spends cutting. It may be considered that the speed of the laser traveling in a straight line is the maximal laser cutting speed, *v_max*, while for a circular arc of nonzero radius, *R*, it is given by *v_max \times exp(-1/R)*