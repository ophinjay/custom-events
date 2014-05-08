if (!window["oj"]) {
    window["oj"] = {};
}

if (!window["oj"]["utilities"]) {
    window["oj"]["utilities"] = {};
}

oj.utilities.CustomEvents = (function() {

    function eventUtility() {
        this.__eventHandlers = {};
    }

    eventUtility.prototype = (function() {

        var addEventListener = function(eventName, handler) {
            if (!isSupported.call(this, eventName)) {
                throwUnsupportedEventException(this, eventName);
            } else if (isDelegatedEvent.call(this, eventName)) {
                var delegatedToObject = getDelegatedToObject.call(this, eventName);
                try {
                    delegatedToObject.addEventListener(eventName, handler);
                } catch (ex) {
                    throwDelegationFailureException(this, delegatedToObject, eventName);
                }
            } else {
                this.__eventHandlers[eventName] = this.__eventHandlers[eventName] || [];
                this.__eventHandlers[eventName].push(handler);
            }
        };

        var raiseEvent = function(eventName, eventObject) {
            this.__eventHandlers[eventName] && this.__eventHandlers[eventName].forEach(function(handler) {
                handler(eventObject);
            });
        };

        function isSupported(eventName) {
            return !this.__allowedEvents || this.__allowedEvents[eventName];
        }

        function isDelegatedEvent(eventName) {
            var eventObject = this.__allowedEvents[eventName];
            return eventObject.constructor === Object && eventObject["delegatedTo"];
        }

        function getDelegatedToObject(eventName) {
            if (!isDelegatedEvent.call(this, eventName)) {
                throw new Error("'" + eventName + "' is not a delegated event!!!");
            }
            var delegatedTo = this.__allowedEvents[eventName]["delegatedTo"];
            return delegatedTo.constructor === String ? this[delegatedTo] : delegatedTo;
        }

        function throwUnsupportedEventException(libObj, eventName) {
            throw new Error("The event " + eventName + " is not supported by the library" + (libObj.__libName.length > 0 ? (" - " + libObj.__libName) : "") + "!!!");
        }

        function throwDelegationFailureException(libObj, delegatedToObj, eventName) {
            throw new Error("The event '" + eventName + "' delegated from " + libObj.__libName + " to " + delegatedToObj.__libName + " is not supported by the target libarary!!!");
        }

        return {
            addEventListener: addEventListener,
            raiseEvent: raiseEvent
        };
    })();

    var initializeObject = function(thatObj) {
        eventUtility.call(thatObj);
    };

    var initializeLibrary = function(targetConstructor, allowedEvents, libraryName) {
        for (var i in eventUtility.prototype) {
            targetConstructor.prototype[i] = eventUtility.prototype[i];
        }
        targetConstructor.prototype["__allowedEvents"] = allowedEvents;
        targetConstructor.prototype["__libName"] = libraryName;
    };

    return {
        "initializeObject": initializeObject,
        "initializeLibrary": initializeLibrary
    };
})();
