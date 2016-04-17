/*
Samuel Gluss
4-16-2016
Plethora Technical Exercise
JSON file helper
*/

(function(){
    //  initialize window objects
    var jh = window.JSONHelper = window.JSONHelper || {};
    var ce = window.cutEstimator = window.cutEstimator || {};
    
    var btn1;
    var btn2;
    var btn3;
    
    $("document").ready(function() {
        inputField = $('#JSONInput');
        json1 = $('#CutCircularArc').attr("href");
        btn2 = $('#ExtrudeCircularArc');
        btn3 = $('#Rectangle');
        
       	btn1.click(function(){
			jh.putJSONInTextField();
		});
        btn2.click(function(){
			jh.putJSONInTextField();
		});
        btn3.click(function(){
			jh.putJSONInTextField();
		});
	});

    jh.putJSONInTextField = function() { 
        
    };    
    /*
    //  Load JSON files for test parts
    var JSON0 = getJSONFromFile("CutCircularArc.json");
    var JSON1 = getJSONFromFile("ExtrudeCircularArc.json");
    var JSON2 = getJSONFromFile("Rectangle.json");
    */
    
    function getJSONFromFile(filename)
    {
        var file = filename;
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(filename) {
            var contents = filename.target.result;
        };
        reader.readAsText(file);
    }
})();