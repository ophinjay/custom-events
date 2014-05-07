var Person = function(name) {
	this.name = name;
	oj.utilities.CustomEvents.initializeObject(this);
};

Person.prototype = (function () {
	var getName = function () {
		return this.name;	
	};

	var setName = function (value) {
		var oldName = this.name;
		this.name = value;
		if(value === "") {
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
});