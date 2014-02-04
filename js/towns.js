// Debugging utility.
//
// When called, appends line with msg string at the end of document.
function debug(msg) {
    var err, ul, body;
    err = document.createElement("li");
    err.innerHTML = ""+ msg;
    if (!$("errors")) {
        ul = document.createElement("ul");
        ul.id = "errors";
        ul.style.textAlign="left";
        body = document.getElementsByTagName("body")[0];
        body.appendChild(ul);
    }
    $("errors").appendChild(err);
}


// Town constructor
// e - the HTML element representing the town
function Town(e) {
    // HTML element which represents the town
    this.element=e;

    // HTML span element which represents static town
    this.label=this.element.firstDescendant();
    // HTML input element which represents the editable town
    this.input=this.createInput();

    // distances, that connect this town to other towns
    this.distances = [];
}
Town.prototype = {

    // adds new distance
    addDistance: function(distance) {
        this.distances.push(distance);
    },

    // removes distance if exists
    removeDistance: function(distance) {
        this.distances = this.distances.without(distance);
    },

    toString: function() {
        return "[" + this.element.id + "]";
    },

    // moves town visually to a new position, updating all the distances
    moveTo: function(x,y) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.updateDistances();
    },

    updateDistances: function() {
        this.distances.invoke("update");
    },

    // destroys the town and all the connected distances
    destroy: function() {
        this.distances.invoke("destroy");
        this.element.remove();
    },

    getTitle: function() {
        return this.label.firstChild.data;
    },

    setTitle: function(title) {
        this.label.firstChild.data = title;
        this.input.value = title;
    },

    // ID-s of town elements consist of
    // a number and character "v" in front of it,
    // because ID-s beginning with digit aren't valid.
    //
    // This method returns the numeric part of the ID.
    getNumericId: function() {
        return this.element.id.replace(/v/,"");
    },

    // Creates HTML input element and
    // inserts it at the end of town element.
    // Finally returns the created element.
    createInput: function() {
        var input = $(document.createElement("input"));
        input.type="text";
        input.value=this.getTitle();
        input.hide();
        this.element.appendChild(input);
        Event.observe(input, "blur", EventHandlers.unfocus);
        return input;
    },

    // hides the textual label and shows input box
    makeEditable: function() {
        this.label.hide();
        this.input.show();
        this.input.focus();
        this.input.select();
    },

    // the opposite of previous method
    makeStatic: function() {
        this.setTitle(this.input.value);
        this.input.hide();
        this.label.show();
        this.updateDistances();
    },

    // functions for retrieving X and Y coordinates of the element
    getX: function() {
        return this.element.style.left.replace(/px/,"");
    },
    getY: function() {
        return this.element.style.top.replace(/px/,"");
    },

    // Converts town to XML fragment, that can be submitted to server
    toXML: function() {
        return "<town>" +
               "<id>" + this.getNumericId() + "</id>" +
               "<name>" + this.getTitle().replace(/</,"&lt;").replace(/>/,"&gt;") + "</name>" +
               "<x>" + this.getX() + "</x>" +
               "<y>" + this.getY() + "</y>" +
               "</town>";
    }
};


// Distance constructor
// start - town where the distance starts
// end - town where the distance ends
// distance - distance from start to end
function Distance(start, end, distance) {
    // HTML element that represents the distance
    this.img = this.createDistanceImg();
    // HTML element that represents the distance value
    this.input = this.createDistanceInput(start,end,distance);

    // The towns, between which the distance exists
    this.start = start;
    this.end = end;

    // make the towns also avare of this distance
    // by adding this distance to the lists of distances those towns.
    start.addDistance(this);
    end.addDistance(this);

    // update graphical display
    this.update();
}
Distance.prototype = {
    // creates new img element that represents the distance
    // images are inserted at the beginning of "towns" div
    createDistanceImg: function() {
        var img = $(document.createElement("img"));
        var ul = $("towns").getElementsByTagName("ul")[0];
        $("towns").insertBefore(img, ul);
        return img;
    },

    // creates new div element that represents the distance
    // distances are inserted at the end of "towns" div
    createDistanceInput: function(start,end,distanceValue) {
        var input = $(document.createElement("input"));
        input.type="text";
        input.value=distanceValue;
        input.id = start.element.id + "-" + end.element.id;
        $("towns").appendChild(input);
        return input;
    },

    // Line drawing function
    // Adopted from http://www.p01.org/articles/DHTML_techniques/Drawing_lines_in_JavaScript/
    //
    // The main concept is, that we can stretch and squeeze images,
    // that contain 45 degree diagonal line, to acheive any diagonal line.
    //
    // For details see the referenced article.
    drawLine: function( lineObjectHandle, Ax, Ay, Bx, By, lineImgPath )
    {
        var xMin = Math.min( Ax, Bx );
        var yMin = Math.min( Ay, By );
        var xMax = Math.max( Ax, Bx );
        var yMax= Math.max( Ay, By );
        var boxWidth = Math.max( xMax-xMin, 1 );
        var boxHeight = Math.max( yMax-yMin, 1 );
        var tmp = Math.min( boxWidth, boxHeight );
        var smallDistance = 1;
        var newSrc;
        var direction;

        // integer-divide tmp by 2 until we reach 0
        while ( tmp = tmp>>1 ) {
            // multiply smallDistance by the same amount times with 2
            smallDistance = smallDistance<<1;
        }

        if ( (Bx-Ax)*(By-Ay) < 0 ) {
            direction = "up";
        }
        else {
            direction = "down";
        }

        newSrc = lineImgPath + smallDistance + direction + ".gif";

        if ( lineObjectHandle.src.indexOf( newSrc )==-1 ) {
            lineObjectHandle.src = newSrc;
        }

        lineObjectHandle.style.width = boxWidth + "px";
        lineObjectHandle.style.height = boxHeight + "px";
        lineObjectHandle.style.left = xMin + "px";
        lineObjectHandle.style.top = yMin + "px";
    },

    moveInput: function(x,y) {
        this.input.style.left = x + "px";
        this.input.style.top = y + "px";
    },

    update: function() {
        var Ax = this.start.element.offsetLeft + (this.start.element.offsetWidth / 2);
        var Ay = this.start.element.offsetTop + (this.start.element.offsetHeight / 2);
        var Bx = this.end.element.offsetLeft + (this.end.element.offsetWidth / 2);
        var By = this.end.element.offsetTop + (this.end.element.offsetHeight / 2);
        this.drawLine(this.img, Ax, Ay, Bx, By, "img/lines/");

        var width = Math.abs(Ax - Bx);
        var height = Math.abs(Ay - By);
        var inputWidth = this.input.offsetWidth;
        var inputHeight = this.input.offsetHeight;
        var x = width/2 + Math.min(Ax,Bx) - inputWidth/2;
        var y = height/2 + Math.min(Ay,By) - inputHeight/2;
        this.moveInput(x,y);
    },

    toString: function() {
        return "(Distance: " + this.start + " - " + this.end + ")";
    },

    // destroys the distance and it's distance label
    // but NOT the vertixes it is connected to
    destroy: function() {
        this.img.remove();
        this.input.remove();
        this.start.removeDistance(this);
        this.end.removeDistance(this);
    },

    // Converts distance to XML fragment, that can be submitted to server
    toXML: function() {
        return "<distance>" +
               "<start>" + this.start.getNumericId() + "</start>" +
               "<end>" + this.end.getNumericId() + "</end>" +
               "<length>" + parseInt(this.input.value, 10) + "</length>" +
               "</distance>";
    }
};


var Map = {
    // Map is a collection of towns and distances between them
    towns: [],
    distances: [],
    idCounter: 1,

    // look for town id with maximum value and
    // make this the idCounter value
    initIdCounter: function() {
        // get maximum id of all towns
        this.idCounter = this.towns.max( function(v) { return v.getNumericId(); } );
    },

    getUniqueId: function() {
        this.idCounter++;
        return "v" + this.idCounter;
    },

    // adds new town to the map, that represents element e
    // and returns the newly created town
    addTown: function(e) {
        var town = new Town(e);
        this.towns.push(town);
        return town;
    },

    // Creates brand new town element and adds it to our map
    createTown: function(title) {
        var e = $(document.createElement("li"));
        var span = $(document.createElement("span"));
        span.appendChild( document.createTextNode(title) );
        e.appendChild( span );
        e.id = this.getUniqueId();
        $$("#towns ul")[0].appendChild(e);
        return this.addTown(e);
    },

    // adds new distance between towns a and b with specified distance
    // and returns the newly created distance
    addDistance: function(a, b, length) {
        var distance = new Distance(a, b, length);
        this.distances.push(distance);
        return distance;
    },

    getTownById: function(id) {
        return this.towns.find( function(town) { return town.element.id==id; } );
    },

    getDistanceById: function(id) {
        return this.distances.find( function(distance) { return distance.input.id==id; } );
    },

    // returns true if distance between towns A and B exists
    // doesn't matter if its A-B or B-A distance.
    distanceExists: function(a, b) {
        return this.getDistanceById(a.element.id+"-"+b.element.id) ||
               this.getDistanceById(b.element.id+"-"+a.element.id);
    },

    removeTown: function(id) {
        // remove town from Map towns list
        var removedTown = this.getTownById(id);
        this.towns = this.towns.without(removedTown);

        // remove all distances from Map distances list, that were connected with this town
        var removedDistances = removedTown.distances;
        this.distances = this.distances.reject( function(distance) {
            return removedDistances.include(distance);
        } );

        // destroy the actual town object
        removedTown.destroy();
    },

    removeDistance: function(id) {
        // remove distance from Map distances list
        var removedDistance = this.getDistanceById(id);
        this.distances = this.distances.without(removedDistance);

        // destroy the actual town object
        removedDistance.destroy();
    },

    // Converts Map to XML document, that can be submitted to server
    toXML: function() {
        var towns = this.towns.invoke("toXML").join("\n");
        var distances = this.distances.invoke("toXML").join("\n");

        return "<?xml version='1.0' encoding='utf-8'?>\n" +
               "<map>\n" +
               "<towns>\n" + towns + "\n</towns>\n" +
               "<distances>\n" + distances + "\n</distances>\n" +
               "</map>\n";
    }

};

var Controls = {
    buttons: [],
    action: "move",
    helpMessage: undefined,

    init: function() {
        Controls.buttons = $A( $("header").getElementsByTagName("button") );

        Controls.buttons.each( function(button) {
            Event.observe(button, "click", Controls.buttonClick);
        } );

        // add help message area to map
        Controls.helpMessage = $(document.createElement("p"));
        Controls.helpMessage.id = "help-message";
        $("towns").appendChild(Controls.helpMessage);
        Controls.updateHelpMessage();

        Event.observe($("enable-help"), "click", Controls.showHideHelpMessage);
        Controls.showHideHelpMessage();
    },

    buttonClick: function(e) {
        Controls.buttons.each( function(button) {
            button.removeClassName("selected");
        } );
        Event.findElement(e,"BUTTON").addClassName("selected");
        Controls.action = Event.element(e).id;

        // set the class of body to the same name as selected ID
        $$("body")[0].className = Controls.action;
        Controls.updateHelpMessage();
    },

    // make the title of the selected menu element appear as help message
    updateHelpMessage: function() {
        Controls.helpMessage.innerHTML = $("header").getElementsByClassName("selected")[0].title;
    },

    // make the title of the selected menu element appear as help message
    showHideHelpMessage: function() {
        if ($("enable-help").checked) {
            Controls.helpMessage.show();
        }
        else {
            Controls.helpMessage.hide();
        }
    }
};

var EventHandlers = {

    selected: undefined,
    selectedX: 0,
    selectedY: 0,

    fromTown: undefined,

    down: function(e) {
        var clickedElement, towns;
        clickedElement = Event.element(e);

        // if list item (town) is clicked
        if (clickedElement.tagName=="LI") {
            // remember the selected element
            this.selected = Map.getTownById(clickedElement.id);

            // save the position where click was made
            towns = $("towns");
            this.selectedX = Event.pointerX(e) - towns.offsetLeft - clickedElement.offsetLeft;
            this.selectedY = Event.pointerY(e) - towns.offsetTop - clickedElement.offsetTop;
        }
    },

    up: function() {
        this.selected = undefined;
    },

    move: function(e) {
        var towns, townsx, townsy, x, y;

        if (this.selected) {
            towns = $("towns");
            townsx = towns.offsetLeft;
            townsy = towns.offsetTop;

            x = Event.pointerX(e) - townsx - this.selectedX;
            y = Event.pointerY(e) - townsy - this.selectedY;

            this.selected.moveTo(x,y);
        }
    },

    click: function(e) {
        var tagName = Event.element(e).tagName;
        var action = Controls.action;

        if (action=="add-town" && tagName!="LI" && tagName!="SPAN" ) {
            EventHandlers.clickAddTown(e);
        }
        else if (action=="add-distance" && Event.findElement(e,"LI")!=document) {
            EventHandlers.clickAddDistance(e);
        }
        else if (action=="delete") {
            EventHandlers.clickDelete(e);
        }
        else if (tagName=="SPAN") {
            EventHandlers.clickEditTown(e);
        }
    },

    clickAddTown: function(e) {
        var town = Map.createTown("Untitled");

        var towns = $("towns");
        var townsx = towns.offsetLeft;
        var townsy = towns.offsetTop;

        var x = Event.pointerX(e) - townsx - town.element.offsetWidth/2;
        var y = Event.pointerY(e) - townsy - town.element.offsetHeight/2;

        town.moveTo(x,y);
        town.makeEditable();
    },

    clickAddDistance: function(e) {
        var currentTown = Map.getTownById(Event.findElement(e,"LI").id);
        var distance;

        if (this.fromTown && this.fromTown == currentTown) {
            // if the already selected town was re-clicked, remove the selection
            this.fromTown.element.removeClassName("selected");
            this.fromTown = undefined;
            return;
        }
        else if ( this.fromTown && Map.distanceExists(this.fromTown, currentTown) ) {
            // if an distance between those towns already exist
            // (either in direction v1 --> v2 or v2 --> v1),
            // then do not add another one
            alert("Kahe linna vahel pole lubatud rohkem kui üks tee.");
        }
        else if (this.fromTown) {
            // if a different town was selected before
            // add distance between formerly selected and current town
            distance = Map.addDistance(this.fromTown, currentTown, 0);

            // remove selection
            this.fromTown.element.removeClassName("selected");
            this.fromTown = undefined;

            // bring focus to distance
            distance.input.focus();
            distance.input.select();
        }
        else {
            // if no town is selected, select current one
            this.fromTown = currentTown;
            this.fromTown.element.addClassName("selected");
        }
    },

    clickDelete: function(e) {
        if ( Event.findElement(e,"LI")!=document ) {
            // clicking inside <li> means deleting a town
            Map.removeTown( Event.findElement(e,"LI").id );
        }
        else if (Event.element(e).tagName=="INPUT") {
            // clicking inside <input> means deleting a distance
            Map.removeDistance( Event.element(e).id );
        }
    },

    clickEditTown: function(e) {
        var town = Map.getTownById( Event.findElement(e,"LI").id );
        town.makeEditable();
    },

    // when focus is removed from town input-box
    unfocus: function(e) {
        var town = Map.getTownById(Event.findElement(e, "LI").id);
        town.makeStatic();
    },

    // when save button is clicked
    save: function() {
        // Convert map to XML and place into hidden field in form
        $("xml").value = Map.toXML();

        // allow form to be submitted
        return true;
    }
};

var Initializer = {

    loadVertices: function() {
        // get all elements containing town names
        var townElements = $("towns").getElementsByTagName("li");

        // grab only the ID-s of those towns
        return $A(townElements).pluck("id");
    },

    distanceHtmlToObject: function(item) {
        var dt = item[0];
        var dd = item[1];

        var towns = dt.getElementsByTagName("span");
        var fromClass = towns[0].className;
        var toClass = towns[1].className;

        var dist = dd.firstChild.data.match( /[0-9.,+-]*/ );

        return {from: fromClass, to: toClass, distance: dist};
    },

    loadDistances: function() {
        // <dt> elements describe from-to relationships
        var dts = $("distances").getElementsByTagName("dt");
        // <dd> elements describe actual distances
        var dds = $("distances").getElementsByTagName("dd");

        // combine the results together
        var rawDistances = $A(dts).zip($A(dds));

        // convert each item to object: {from: A, to: B, distance: C}
        return rawDistances.map( Initializer.distanceHtmlToObject );
    },

    setupEventHandlers: function() {
        var towns = $("towns");
        Event.observe(towns, "mousedown", EventHandlers.down);
        Event.observe(towns, "mouseup", EventHandlers.up);
        Event.observe(towns, "mousemove", EventHandlers.move);
        Event.observe(towns, "click", EventHandlers.click);

        $("save-button").onclick=EventHandlers.save;
    },

    setupMap: function() {
        // load distances and towns
        var vertices = Initializer.loadVertices();
        var distances = Initializer.loadDistances();

        vertices.each( function(id){ Map.addTown($(id)); } );

        distances.each( function(e){
            Map.addDistance(Map.getTownById(e.from), Map.getTownById(e.to), e.distance);
        } );

        // initialize ID counter
        Map.initIdCounter();
    },

    start: function() {
        Initializer.setupMap();

        // set up event handlers
        Initializer.setupEventHandlers();

        // initialize toolbar
        Controls.init();
    }
};

Event.observe(window, "load", Initializer.start);
