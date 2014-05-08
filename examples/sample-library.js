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

var Customer = function(name, id) {
    this.id = id;
    this.person = new Person(name);
    oj.utilities.CustomEvents.initializeObject(this);
};

Customer.prototype = (function() {
    var setId = function(value) {
        var oldId = this.id;
        this.id = value;
        if (value === "") {
            this.raiseEvent("on-id-empty");
        } else if (oldId !== value) {
            this.raiseEvent("on-id-changed", {
                "oldId": oldId,
                "newId": value
            });
        }
    };

    return {
    	"setId": setId
    };
})();

oj.utilities.CustomEvents.initializeLibrary(Customer, {
	"on-id-empty": true,
	"on-id-changed": true,
    "on-name-changed": {
    	"delegatedTo": "person"
    },
    "on-name-empty": {
    	"delegatedTo": "person"
    }
}, "Customer");
