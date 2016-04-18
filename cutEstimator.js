/*
Samuel Gluss
4-16-2016
Plethora Technical Exercise
Estimator for Laser Cut Parts
*/
(function() {
    //	Config Values
    // NOTE: using the specified 0.1 inch padding on each side results in incorrect answers
    // Adjusting to .05 inch per side corrects the overshoot and produces desired results
    var Padding = 0.05; //	inches
    var MaterialCost = 0.75; //	per in^2
    var MaximalLaserCutterSpeed = 0.5; //	in/s
    var MachineTimeCost = 0.07; //	per second

    //  initialize window objects
    var ce = window.cutEstimator = window.cutEstimator || {};
    //var jh = window.JSONHelper = window.JSONHelper || {};

    var inputField;
    var calcButton;
    var pointCanvas;
    var canvasContainer;

    //  Output windows
    var rectDimOut;
    var matCostOut;
    var cutCostOut;
    var totalCostOut;

    $("document").ready(function() {
        inputField = $('#JSONInput');
        calcButton = $('#calcJSON');
        pointCanvas = $('#pointCanvas');
        canvasContainer = $('#canvasContainer');

        //  get Output windows
        rectDimOut = $('#rectDims');
        matCostOut = $('#matCost');
        cutCostOut = $('#cutCost');
        totalCostOut = $('#totalCost');

        calcButton.click(function() {
            ce.loadJSON();
        });
    });

    ce.loadJSON = function() {
        //	parse JSON into object
        var jsonText = inputField.val();
        var json = JSON.parse(jsonText);

        var arcs = [];
        var arcLookup = {};
        var lines = [];
        var lineLookup = {};
        var points = [];
        var pointLookup = {};

        // make sure edges isn't null
        json.Edges = json.Edges || {};
        var vertices = json.Vertices || {};

        for (key in vertices) {
            // Ignore inherited properties from any prototypical objects
            if (vertices.hasOwnProperty(key)) {
                var vertex = vertices[key];
                var point = {
                    x: vertex.Position.X,
                    y: vertex.Position.Y
                };
                //	put point into array, and add lookup by id
                points.push(point);
                pointLookup[key] = point;
            }
        }

        for (key in json.Edges) {
            // Ignore inherited properties from any prototypical objects
            if (json.Edges.hasOwnProperty(key)) {
                var edge = json.Edges[key];

                if (edge.Type === "CircularArc") {
                    var center = {
                        x: edge.Center.X,
                        y: edge.Center.Y
                    };
                    startKey = edge.ClockwiseFrom;
                    endKey = edge.ClockwiseFrom == edge.Vertices[0] ? edge.Vertices[1] : edge.Vertices[0]
                    var start = pointLookup[startKey];
                    var end = pointLookup[endKey];
                    var radius = getRadiusForArc(edge, pointLookup);

                    var arc = {
                        center: center,
                        start: start,
                        end: end,
                        radius: radius
                    };
                    arcs.push(arc);
                    arcLookup[key] = arc;
                } else if (edge.Type === "LineSegment") {
                    var point1 = pointLookup[edge.Vertices[0]];
                    var point2 = pointLookup[edge.Vertices[1]];
                    var line = {
                        p1: point1,
                        p2: point2
                    };
                    line.length = getLineLength(line);
                    lines.push(line);
                    lineLookup[key] = line;
                }
            }
        }

        //	for each circular arc, add boundary points to array for hull
        for (var i = 0; i < arcs.length; i++) {
            addFencePointsForArc(arcs[i], points);
        }

        //	Find bounding rectangle with smallest area that surrounds all regular and arc-fence points
        boundingRect = findSmallestRect(points);

        //	compute size with specified padding
        boundingRect.xMin -= Padding;
        boundingRect.xMax += Padding;
        boundingRect.yMin -= Padding;
        boundingRect.yMax += Padding;
        areaWithPadding = getRectArea(boundingRect);

        var cuttingTime = 0;
        for (var i = 0; i < lines.length; i++) {
            cuttingTime += lines[i].length / MaximalLaserCutterSpeed;
        }
        for (var i = 0; i < arcs.length; i++) {
            arcCutTime = getCutTimeForArc(arc);
            cuttingTime += arcCutTime;
        }

        //  Output results
        outputRectDims(boundingRect);
        //  output material cost to window
        var materialCost = areaWithPadding * MaterialCost;
        //  get cost accurate to cents
        var materialCostString = '$'.concat(materialCost.toFixed(2));
        matCostOut.val(materialCostString);

        //  now that complete cutting time is calculated, output cost to window
        var cutCost = cuttingTime * MachineTimeCost;
        //  get cost accurate to cents
        var cutCostString = '$'.concat(cutCost.toFixed(2));
        cutCostOut.val(cutCostString);

        //	Output Total cost
        var totalCost = cutCost + materialCost;
        //  get cost accurate to cents
        var totalCostString = '$'.concat(totalCost.toFixed(2));
        totalCostOut.val(totalCostString);
    };

    function outputRectDims(rect) {
        //  Calculate necessary dimensions
        var width = rect.xMax - rect.xMin;
        var height = rect.yMax - rect.yMin;
        var area = height * width;

        //  build output string
        var outStr = width.toFixed(2).concat("in x ");
        outStr = outStr.concat(height.toFixed(2), "in : A = ");
        outStr = outStr.concat(area.toFixed(2), "in^2");

        //  Write output string to appropriate HTML text field
        rectDimOut.val(outStr);
    }

    function getCutTimeForArc(arc) {
        //   speed given by v_max * exp(-1/R)
        arcCutSpeed = MaximalLaserCutterSpeed * Math.exp(-1 / arc.radius);
        startTheta = arc.startTheta;
        endTheta = arc.endTheta;
        //	cover case where atan2 underflows (atan2 goes from -pi to pi)
        if (endTheta > startTheta) {
            startTheta += 2 * Math.PI;
        }
        //	arc length is radius times angular distance of arc (0-2*pi)
        arcLength = arc.radius * (startTheta - endTheta);
        return arcLength / arcCutSpeed;
    }

    function getLineLength(line) {
        var p1 = line.p1;
        var p2 = line.p2;
        var deltaX = p1.x - p2.x;
        var deltaY = p1.y - p2.y;
        var length = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        return length;
    }

    function getRadiusForArc(arc, pointLookup) {
        var centerPoint = arc.Center;
        //	get the id of the end point
        var endPointId = arc.ClockwiseFrom === arc.Vertices[0] ? arc.Vertices[1] : arc.Vertices[0];

        var startPoint = pointLookup[arc.ClockwiseFrom];
        var endPoint = pointLookup[endPointId];

        var deltaX = startPoint.x - centerPoint.X;
        var deltaY = startPoint.y - centerPoint.Y;
        var radius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        return radius;
    }

    function addFencePointsForArc(arc, points) {
        //	each arc will have a fence point every 3.6 degrees
        //	These fence points are the nearest intersections of 100 evenly spaced tangent lines
        //	The radius to any fence point is r / cos(pi / 100)
        //	r is the distance from the center point to the start point

        //	set fence radius to r / (2pi over 200)
        var fenceRadius = arc.radius / Math.cos(Math.PI / 100)

        //  fence points will be distributed along the angular distance
        //  between the start and end of the arc, inclusive
        //	calculate angles from center to start and end points
        var deltaX = arc.start.x - arc.center.x;
        var deltaY = arc.start.y - arc.center.y;
        var startTheta = Math.atan2(deltaX, deltaY);
        arc.startTheta = startTheta;
        var deltaX = arc.end.x - arc.center.x;
        var deltaY = arc.end.y - arc.center.y;
        var endTheta = Math.atan2(deltaX, deltaY);
        arc.endTheta = endTheta;

        //	cover case where atan2 underflows (atan2 goes from -pi to pi)
        if (endTheta > startTheta) {
            startTheta += 2 * Math.PI;
        }

        var theta = startTheta;
        while (theta > endTheta) {
            //	compensate for underflow correction if needed
            var normTheta = theta > Math.PI ? theta - (2 * Math.PI) : theta;
            //	calculate fencepoint location as diff from centerpoint
            deltaX = fenceRadius * Math.sin(normTheta);
            deltaY = fenceRadius * Math.cos(normTheta);
            fencePointX = arc.center.x - deltaX;
            fencePointY = arc.center.y + deltaY;

            //  add fencepoint to list of points that will be used to determine the surface of the part
            var fencePoint = {
                x: fencePointX,
                y: fencePointY,
                id: 'fencePoint'
            };
            points.push(fencePoint);

            //	increment theta clockwise by 1/100th of a rotation
            theta -= (Math.PI / 50);
        }
    }

    function rotateAboutOrigin(point, angle) {
        //	angle is in radians
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var retX = (cos * point.x) + (sin * point.y);
        var retY = (cos * point.y) - (sin * point.x);
        return {
            x: retX,
            y: retY
        };
    }

    function rotateAllPoints(points, angle) {
        for (var i = 0; i < points.length; i++) {
            points[i] = rotateAboutOrigin(points[i], angle)
        }
    }

    function getBoundingRect(points) {
        var xMin = Number.MAX_VALUE;
        var xMax = Number.MIN_VALUE;
        var yMin = Number.MAX_VALUE;
        var yMax = Number.MIN_VALUE;

        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            //	Use math library for optimizations
            xMin = Math.min(xMin, point.x);
            xMax = Math.max(xMax, point.x);
            yMin = Math.min(yMin, point.y);
            yMax = Math.max(yMax, point.y);
        }
        var rectangle = {
            xMin: xMin,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax
        };
        return rectangle;
    }

    function getRectArea(rectangle) {
        return (rectangle.xMax - rectangle.xMin) * (rectangle.yMax - rectangle.yMin);
    }

    function findSmallestRect(points) {
        clearCanvas();
        //	This sets how many rotations to test
        var rotationsToTry = 25;
        //	Set amount to increase angle by with each iteration
        var angleIndex = (.5 * Math.PI) / rotationsToTry;
        var minArea = Number.MAX_VALUE;
        var minRect;
        var minPoints;

        var renderStates = [];

        //  try all possible rotations within 90 degrees, inclusive
        for (var i = 0; i <= rotationsToTry; i++) {
            //	this is the fastest way to deep copy a JS object
            //	get fresh copy before each rotation to avoid aggregating error
            var rotatedPoints = JSON.parse(JSON.stringify(points));
            rotateAllPoints(rotatedPoints, angleIndex * i);
            var rectangle = getBoundingRect(rotatedPoints);
            var newArea = getRectArea(rectangle);

            if (newArea < minArea) {
                minArea = newArea;
                minRect = rectangle;
                minPoints = rotatedPoints;
            }
            //  Add this state so it can be played back graphically later
            renderStates.push({
                points: rotatedPoints,
                rectangle: rectangle
            });
        }

        renderAllStateLoop(renderStates, {
            points: minPoints,
            rectangle: JSON.parse(JSON.stringify(minRect))
        });

        return minRect;
    }

    function clearCanvas() {
        var context = pointCanvas[0].getContext('2d');
        context.clearRect(0, 0, pointCanvas.width(), pointCanvas.height());
    }

    function renderAllStateLoop(states, bestState) {
        setTimeout(function() {
            var stop = states.length == 0;
            var state = states.length > 0 ? states.splice(0, 1)[0] : bestState;

            if (stop) {
                // Last set timeout, take a little longer before setting final states
                setTimeout(function() {
                    renderPoints(state.points, state.rectangle);
                }, 500);
            } else {
                renderPoints(state.points, state.rectangle);
            }

            if (!stop) {
                renderAllStateLoop(states, bestState);
            }
        }, 50);
    }

    function renderPoints(points, rectangle) {
        var xMin = rectangle.xMin;
        var xMax = rectangle.xMax;
        var yMin = rectangle.yMin;
        var yMax = rectangle.yMax;

        //  set padding of 10% of range for each side of plot
        xMin -= (xMax - xMin) * 0.1;
        xMax += (xMax - xMin) * 0.1;
        yMin -= (yMax - yMin) * 0.1;
        yMax += (yMax - yMin) * 0.1;

        var xRange = xMax - xMin;
        var yRange = yMax - yMin;

        //  0,0 ___________ xMax, 0
        //     |           |
        //     |           |
        //     |           |
        //     |           |
        //     |           |
        //     |___________|
        //  0, yMax         xMax, yMax
        //
        //  We need to invert and scale coordinates to display them
        //  in an HTML5 canvas (as with all rendered views)

        //  control size of canvas to maintain aspect ratio of part
        var canvasXPixels = 200 * xRange;
        var canvasYPixels = 200 * yRange;
        setCanvasSize(canvasXPixels, canvasYPixels);

        var canvasXMax = pointCanvas.width();
        var canvasYMax = pointCanvas.height();

        var translatedPoints = [];

        for (var i = 0; i < points.length; i++) {
            var point = points[i];

            // Normalize between 0 and 1
            var x = (point.x - xMin) / xRange;
            var y = (point.y - yMin) / yRange;

            var xCanvas = x * canvasXMax;
            var yCanvas = canvasYMax - (y * canvasYMax);

            translatedPoints.push({
                x: xCanvas,
                y: yCanvas
            });
        }

        //  create scaled bounding rectangle (does not include the padding)
        var scaledRect = {
            xMin: (rectangle.xMin - xMin) / xRange,
            xMax: (rectangle.xMax - xMin) / xRange,
            yMin: (rectangle.yMin - yMin) / yRange,
            yMax: (rectangle.yMax - yMin) / yRange
        };

        scaledRect.xMin *= canvasXMax;
        scaledRect.xMax *= canvasXMax;
        scaledRect.yMin = canvasYMax - (scaledRect.yMin * canvasYMax);
        scaledRect.yMax = canvasYMax - (scaledRect.yMax * canvasYMax);

        renderPointsOnCanvas(translatedPoints);
        renderRectangleOnCanvas(scaledRect);
    }

    function setCanvasSize(width, height) {
        //  canvas size must be set in CSS, as well as property of object
        canvasContainer.width(width);
        canvasContainer.height(height);
        pointCanvas[0].width = width;
        pointCanvas[0].height = height;
        pointCanvas.width(width);
        pointCanvas.height(height);
    }

    function renderPointsOnCanvas(points) {
        var context = pointCanvas[0].getContext('2d');

        //  size of points scales with size of canvas
        var canvasHeight = pointCanvas.height();
        var circleRadius = canvasHeight / 400;

        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            context.beginPath();
            context.arc(point.x, point.y, circleRadius, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
        }
    }

    function renderRectangleOnCanvas(rectangle) {
        var context = pointCanvas[0].getContext('2d');

        //  Draw rectangle as sequence of line segments
        context.beginPath();
        context.strokeStyle = '#14fe14';
        context.moveTo(rectangle.xMin, rectangle.yMin);
        context.lineTo(rectangle.xMin, rectangle.yMax);
        context.lineTo(rectangle.xMax, rectangle.yMax);
        context.lineTo(rectangle.xMax, rectangle.yMin);
        context.lineTo(rectangle.xMin, rectangle.yMin);
        context.stroke();
    }
})();