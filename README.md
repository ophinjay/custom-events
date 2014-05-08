# CustomEvents.js

CustomEvents.js is a library for adding custom event capabilities to JavaScript modules. Supported features include

* Defining custom events for a library
* Registering event handlers for defined events
* Raising these events from the library
* Delegating events to another object

## Use case
For the discussions that follow, assume the example of a module `Person`. This module is initialized with the name of a person. The sections that follow will discuss how the custom events `on-name-changed` and `on-name-empty`, to be triggered when the name is changed and empty respectively, can be added to the `Person` library.
	
    var Person = function(name) {
        this.name = name;
    };

    Person.prototype = (function() {
        var setName = function(value) {
            this.name = value;
        };

        return {
            "setName": setName
        };
    })(); 

## Initializing target module
Initializing a target module, to raise custom events involves 2 steps as described below
  
### Defining events
The first step in the initialization procedure is to define events that will be raised by the target module. This is done by invoking the `initializeLibrary()` utility of the `CustomEvents` library with a list of events that the target module wants to raise.

	oj.utilities.CustomEvents.initializeLibrary(<constructor function>, <event configuration>,
												 "<library name>");

* `<constructor function>` - Reference to the constructor function of the target module. `Person` function in this case.
* `<event configuration>` - JSON object with names of the custom events as the key and the value as `true`. Eg. `{"event-name-1": true, "event-name-2": true ... }`
* `<library name>` - Name of the target module. This can be any string. Name provided here will be used in exception messages thrown by the `CustomEvents` library.

### Initializing object
Every instance of the target module should be initialized with a number of variables that the `CustomEvents` library requires for its operation. The utility function `initializeObject()` of the `CustomEvents` library should be invoked from the constructor of the target module, passing as input the current instance(`this` object) that is getting created.

	oj.utilities.CustomEvents.initializeObject(this);

Modified definition for `Person` module after initializing the library

	var Person = function(name) {
        this.name = name;
        oj.utilities.CustomEvents.initializeObject(this);  //Initializing variables
    };

    Person.prototype = (function() {
        var setName = function(value) {
            this.name = value;
        };

        return {
            "setName": setName
        };
    })();
	
	/**
	 * Defining events on-name-changed and on-name-empty
	 * /
	oj.utilities.CustomEvents.initializeLibrary(Person, {
	    "on-name-changed": true,
	    "on-name-empty": true
	}, "Person");

> **Note:** The `initializeLibrary()` utility adds a number of functions to the `prototype` object of the constructor function. In the `Person` library it is required that `initializeLibrary()` be called after the `prototype` definition i.e after the line where `Person.prototype` is assigned. If `initializeLibrary()` was called before that line, the functionality added by the `CustomEvents` library will be lost as in the next line the entire prototype definition is being redefined.

## Raising events
The next step is to actually raise the event from the target module. This is done by invoking the `raiseEvent()` method(added to the prototype by the library). When an event is raised, every event handler registered for that event name will be called sequentially in the order that the handlers were registered.

	this.raiseEvent(<event name>, <event object>);

* `<event name>` - a valid event name that was defined while calling `initializeLibrary()`
* `<event object>` - handlers registered for the event will be called with this object as a parameter.

Modified definition for `Person` module after raising events

	var Person = function(name) {
	    this.name = name;
	    oj.utilities.CustomEvents.initializeObject(this);
	};

	Person.prototype = (function() {
	    var getName = function() {
	        return this.name;
	    };
	
	    var setName = function(value) {
	        var oldName = this.name;
	        this.name = value;
	        if (value === "") {
	            this.raiseEvent("on-name-empty");
	        } else if (oldName !== value) {
	            this.raiseEvent("on-name-changed", {
	                "oldName": oldName,
	                "newName": value
	            });
	        }
	    };
	
	    return {
	        "getName": getName,
	        "setName": setName
	    };
	
	})();

	oj.utilities.CustomEvents.initializeLibrary(Person, {
	    "on-name-changed": true,
	    "on-name-empty": true
	}, "Person");

## Adding event handlers
Users of the target module can register events by calling the `addEventListener()` method(added by the library) with the name of the event and the handler function.

	var person = new Person("John");
	person.addEventListener("on-name-changed", function(eventObject) {
		console.log("Name changed from " + eventObject.oldName + " to " + eventObject.newName);
	});
