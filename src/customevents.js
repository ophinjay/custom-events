if (!window["oj"]) {
    window["oj"] = {};
}

if (!window["oj"]["utilities"]) {
    window["oj"]["utilities"] = {};
}

oj.utilities.CustomEvents = (function() {

    function eventUtility() {
        this.eventHandlers = {};
    }

    eventUtility.prototype = (function() {

        var addEventListener = function(eventName, handler) {
            if (!this.isSupported(eventName)) {
                throwUnsupportedEventException(this, eventName);
            } else if (this.isDelegatedEvent(eventName)) {
                var delegatedToObject = this.getDelegatedToObject(eventName);
                try {
                    delegatedToObject.addEventHandler(eventName, handler);
                } catch (ex) {
                    throwDelegationFailureException(this, delegatedToObject, eventName);
                }
            } else {
                this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
                this.eventHandlers[eventName].push(handler);
            }
        };

        var raiseEvent = function(eventName, eventObject) {
            this.eventHandlers[eventName] && this.eventHandlers[eventName].forEach(function(handler) {
                handler(eventObject);
            });
        };

        var isSupported = function(eventName) {
            return !this.allowedEvents || this.allowedEvents[eventName];
        };

        var isDelegatedEvent = function(eventName) {
            var eventObject = this.allowedEvents[eventName];
            return eventObject.constructor === Object && eventObject["delegatedTo"];
        };

        var getDelegatedToObject = function(eventName) {
            if (!this.isDelegatedEvent(eventName)) {
                throw new Error("'" + eventName + "' is not a delegated event!!!");
            }
            var delegatedTo = this.allowedEvents[eventName]["delegatedTo"];
            return delegatedTo.constructor === String ? this[delegatedTo] : delegatedTo;
        };

        function throwUnsupportedEventException(libObj, eventName) {
            throw new Error("The event " + eventName + " is not supported by the library" + (libObj.libName.length > 0 ? (" - " + libObj.libName) : "") + "!!!");
        }

        function throwDelegationFailureException(libObj, delegatedToObj, eventName) {
            throw new Error("The event '" + eventName + "' delegated from " + libObj.libName + " to " + delegatedToObj.libName + "is not supported by the target libarary!!!");
        }

        return {
            addEventListener: addEventListener,
            raiseEvent: raiseEvent,
            isSupported: isSupported,
            isDelegatedEvent: isDelegatedEvent,
            getDelegatedToObject: getDelegatedToObject
        };
    })();

    var initializeObject = function(thatObj) {
        eventUtility.call(thatObj);
    };

    var initializeLibrary = function(targetConstructor, allowedEvents, libraryName) {
        for (var i in eventUtility.prototype) {
            targetConstructor.prototype[i] = eventUtility.prototype[i];
        }
        targetConstructor.prototype["allowedEvents"] = allowedEvents;
        targetConstructor.prototype["libName"] = libraryName;
    };

    return {
        "initializeObject": initializeObject,
        "initializeLibrary": initializeLibrary
    };
})();
