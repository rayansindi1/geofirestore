'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Creates a GeoCallbackRegistration instance.
 */
var GeoCallbackRegistration = /** @class */ (function () {
    /**
     * @param _cancelCallback Callback to run when this callback registration is cancelled.
     */
    function GeoCallbackRegistration(_cancelCallback) {
        this._cancelCallback = _cancelCallback;
        if (Object.prototype.toString.call(this._cancelCallback) !== '[object Function]') {
            throw new Error('callback must be a function');
        }
    }
    /********************/
    /*  PUBLIC METHODS  */
    /********************/
    /**
     * Cancels this callback registration so that it no longer fires its callback. This
     * has no effect on any other callback registrations you may have created.
     */
    GeoCallbackRegistration.prototype.cancel = function () {
        if (typeof this._cancelCallback !== 'undefined') {
            this._cancelCallback();
            this._cancelCallback = undefined;
        }
    };
    return GeoCallbackRegistration;
}());

// Default geohash length
var GEOHASH_PRECISION = 10;
// Characters used in location geohashes
var BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
// The meridional circumference of the earth in meters
var EARTH_MERI_CIRCUMFERENCE = 40007860;
// Length of a degree latitude at the equator
var METERS_PER_DEGREE_LATITUDE = 110574;
// Number of bits per geohash character
var BITS_PER_CHAR = 5;
// Maximum length of a geohash in bits
var MAXIMUM_BITS_PRECISION = 22 * BITS_PER_CHAR;
// Equatorial radius of the earth in meters
var EARTH_EQ_RADIUS = 6378137.0;
// The following value assumes a polar radius of
// const EARTH_POL_RADIUS = 6356752.3;
// The formulate to calculate E2 is
// E2 == (EARTH_EQ_RADIUS^2-EARTH_POL_RADIUS^2)/(EARTH_EQ_RADIUS^2)
// The exact value is used here to avoid rounding errors
var E2 = 0.00669447819799;
// Cutoff for rounding errors on double calculations
var EPSILON = 1e-12;
/**
 * Calculates the base 2 logarithm of the given number.
 *
 * @param x A number
 * @returns The base 2 logarithm of a number
 */
function log2(x) {
    return Math.log(x) / Math.log(2);
}
/**
 * Validates the inputted key and throws an error, or returns boolean, if it is invalid.
 *
 * @param key The key to be verified.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
function validateKey(key, flag) {
    if (flag === void 0) { flag = false; }
    var error;
    if (typeof key !== 'string') {
        error = 'key must be a string';
    }
    else if (key.length === 0) {
        error = 'key cannot be the empty string';
    }
    else if (1 + GEOHASH_PRECISION + key.length > 755) {
        // Firebase can only stored child paths up to 768 characters
        // The child path for this key is at the least: 'i/<geohash>key'
        error = 'key is too long to be stored in Firebase';
    }
    else if (/[\[\].#$\/\u0000-\u001F\u007F]/.test(key)) {
        // Firebase does not allow node keys to contain the following characters
        error = 'key cannot contain any of the following characters: . # $ ] [ /';
    }
    if (typeof error !== 'undefined' && !flag) {
        throw new Error('Invalid GeoFire key \'' + key + '\': ' + error);
    }
    else {
        return !error;
    }
}
/**
 * Validates the inputted location and throws an error, or returns boolean, if it is invalid.
 *
 * @param location The Firestore GeoPoint to be verified.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
function validateLocation(location, flag) {
    if (flag === void 0) { flag = false; }
    var error;
    if (!location) {
        error = 'GeoPoint must exist';
    }
    else if (typeof location.latitude === 'undefined') {
        error = 'latitude must exist on GeoPoint';
    }
    else if (typeof location.longitude === 'undefined') {
        error = 'longitude must exist on GeoPoint';
    }
    else {
        var latitude = location.latitude;
        var longitude = location.longitude;
        if (typeof latitude !== 'number' || isNaN(latitude)) {
            error = 'latitude must be a number';
        }
        else if (latitude < -90 || latitude > 90) {
            error = 'latitude must be within the range [-90, 90]';
        }
        else if (typeof longitude !== 'number' || isNaN(longitude)) {
            error = 'longitude must be a number';
        }
        else if (longitude < -180 || longitude > 180) {
            error = 'longitude must be within the range [-180, 180]';
        }
    }
    if (typeof error !== 'undefined' && !flag) {
        throw new Error('Invalid GeoFire location: ' + error);
    }
    else {
        return !error;
    }
}
/**
 * Validates the inputted geohash and throws an error, or returns boolean, if it is invalid.
 *
 * @param geohash The geohash to be validated.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
function validateGeohash(geohash, flag) {
    if (flag === void 0) { flag = false; }
    var error;
    if (typeof geohash !== 'string') {
        error = 'geohash must be a string';
    }
    else if (geohash.length === 0) {
        error = 'geohash cannot be the empty string';
    }
    else {
        for (var _i = 0, geohash_1 = geohash; _i < geohash_1.length; _i++) {
            var letter = geohash_1[_i];
            if (BASE32.indexOf(letter) === -1) {
                error = 'geohash cannot contain \'' + letter + '\'';
            }
        }
    }
    if (typeof error !== 'undefined' && !flag) {
        throw new Error('Invalid GeoFire geohash \'' + geohash + '\': ' + error);
    }
    else {
        return !error;
    }
}
/**
 * Validates the inputted GeoFirestore object and throws an error, or returns boolean, if it is invalid.
 *
 * @param geoFirestoreObj The GeoFirestore object to be validated.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
function validateGeoFirestoreObject(geoFirestoreObj, flag) {
    if (flag === void 0) { flag = false; }
    var error;
    error = (!validateGeohash(geoFirestoreObj.g, true)) ? 'invalid geohash on object' : null;
    error = (!validateLocation(geoFirestoreObj.l, true)) ? 'invalid location on object' : error;
    if (!geoFirestoreObj || !('d' in geoFirestoreObj) || typeof geoFirestoreObj.d !== 'object') {
        error = 'no valid document found';
    }
    if (error && !flag) {
        throw new Error('Invalid GeoFirestore object: ' + error);
    }
    else {
        return !error;
    }
}
/**
 * Validates the inputted query criteria and throws an error if it is invalid.
 *
 * @param newQueryCriteria The criteria which specifies the query's center and/or radius.
 * @param requireCenterAndRadius The criteria which center and radius required.
 */
function validateCriteria(newQueryCriteria, requireCenterAndRadius) {
    if (requireCenterAndRadius === void 0) { requireCenterAndRadius = false; }
    if (typeof newQueryCriteria !== 'object') {
        throw new Error('QueryCriteria must be an object');
    }
    else if (typeof newQueryCriteria.center === 'undefined' && typeof newQueryCriteria.radius === 'undefined' && typeof newQueryCriteria.query === 'undefined') {
        throw new Error('radius and/or center must be specified');
    }
    else if (requireCenterAndRadius && (typeof newQueryCriteria.center === 'undefined' || typeof newQueryCriteria.radius === 'undefined')) {
        throw new Error('QueryCriteria for a new query must contain both a center and a radius');
    }
    else if (!['[object Function]', '[object Null]', '[object Undefined]'].includes(Object.prototype.toString.call(newQueryCriteria.query))) {
        throw new Error('query of QueryCriteria must be a function');
    }
    // Throw an error if there are any extraneous attributes
    var keys = Object.keys(newQueryCriteria);
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (!['center', 'radius', 'query'].includes(key)) {
            throw new Error('Unexpected attribute \'' + key + '\' found in query criteria');
        }
    }
    // Validate the 'center' attribute
    if (typeof newQueryCriteria.center !== 'undefined') {
        validateLocation(newQueryCriteria.center);
    }
    // Validate the 'radius' attribute
    if (typeof newQueryCriteria.radius !== 'undefined') {
        if (typeof newQueryCriteria.radius !== 'number' || isNaN(newQueryCriteria.radius)) {
            throw new Error('radius must be a number');
        }
        else if (newQueryCriteria.radius < 0) {
            throw new Error('radius must be greater than or equal to 0');
        }
    }
}
/**
 * Converts degrees to radians.
 *
 * @param degrees The number of degrees to be converted to radians.
 * @returns The number of radians equal to the inputted number of degrees.
 */
function degreesToRadians(degrees) {
    if (typeof degrees !== 'number' || isNaN(degrees)) {
        throw new Error('Error: degrees must be a number');
    }
    return (degrees * Math.PI / 180);
}
/**
 * Generates a geohash of the specified precision/string length from the inputted GeoPoint.
 *
 * @param location The GeoPoint to encode into a geohash.
 * @param precision The length of the geohash to create. If no precision is specified, the
 * global default is used.
 * @returns The geohash of the inputted location.
 */
function encodeGeohash(location, precision) {
    if (precision === void 0) { precision = GEOHASH_PRECISION; }
    validateLocation(location);
    if (typeof precision === 'number' && !isNaN(precision)) {
        if (precision <= 0) {
            throw new Error('precision must be greater than 0');
        }
        else if (precision > 22) {
            throw new Error('precision cannot be greater than 22');
        }
        else if (Math.round(precision) !== precision) {
            throw new Error('precision must be an integer');
        }
    }
    else {
        throw new Error('precision must be a number');
    }
    var latitudeRange = {
        min: -90,
        max: 90
    };
    var longitudeRange = {
        min: -180,
        max: 180
    };
    var hash = '';
    var hashVal = 0;
    var bits = 0;
    var even = 1;
    while (hash.length < precision) {
        var val = even ? location.longitude : location.latitude;
        var range = even ? longitudeRange : latitudeRange;
        var mid = (range.min + range.max) / 2;
        if (val > mid) {
            hashVal = (hashVal << 1) + 1;
            range.min = mid;
        }
        else {
            hashVal = (hashVal << 1) + 0;
            range.max = mid;
        }
        even = !even;
        if (bits < 4) {
            bits++;
        }
        else {
            bits = 0;
            hash += BASE32[hashVal];
            hashVal = 0;
        }
    }
    return hash;
}
/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param distance The distance to convert.
 * @param latitude The latitude at which to calculate.
 * @returns The number of degrees the distance corresponds to.
 */
function metersToLongitudeDegrees(distance, latitude) {
    var radians = degreesToRadians(latitude);
    var num = Math.cos(radians) * EARTH_EQ_RADIUS * Math.PI / 180;
    var denom = 1 / Math.sqrt(1 - E2 * Math.sin(radians) * Math.sin(radians));
    var deltaDeg = num * denom;
    if (deltaDeg < EPSILON) {
        return distance > 0 ? 360 : 0;
    }
    else {
        return Math.min(360, distance / deltaDeg);
    }
}
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param resolution The desired resolution.
 * @param latitude The latitude used in the conversion.
 * @return The bits necessary to reach a given resolution, in meters.
 */
function longitudeBitsForResolution(resolution, latitude) {
    var degs = metersToLongitudeDegrees(resolution, latitude);
    return (Math.abs(degs) > 0.000001) ? Math.max(1, log2(360 / degs)) : 1;
}
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param resolution The bits necessary to reach a given resolution, in meters.
 * @returns Bits necessary to reach a given resolution, in meters, for the latitude.
 */
function latitudeBitsForResolution(resolution) {
    return Math.min(log2(EARTH_MERI_CIRCUMFERENCE / 2 / resolution), MAXIMUM_BITS_PRECISION);
}
/**
 * Wraps the longitude to [-180,180].
 *
 * @param longitude The longitude to wrap.
 * @returns longitude The resulting longitude.
 */
function wrapLongitude(longitude) {
    if (longitude <= 180 && longitude >= -180) {
        return longitude;
    }
    var adjusted = longitude + 180;
    if (adjusted > 0) {
        return (adjusted % 360) - 180;
    }
    else {
        return 180 - (-adjusted % 360);
    }
}
/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param coordinate The coordinate as a Firestore GeoPoint.
 * @param size The size of the bounding box.
 * @returns The number of bits necessary for the geohash.
 */
function boundingBoxBits(coordinate, size) {
    var latDeltaDegrees = size / METERS_PER_DEGREE_LATITUDE;
    var latitudeNorth = Math.min(90, coordinate.latitude + latDeltaDegrees);
    var latitudeSouth = Math.max(-90, coordinate.latitude - latDeltaDegrees);
    var bitsLat = Math.floor(latitudeBitsForResolution(size)) * 2;
    var bitsLongNorth = Math.floor(longitudeBitsForResolution(size, latitudeNorth)) * 2 - 1;
    var bitsLongSouth = Math.floor(longitudeBitsForResolution(size, latitudeSouth)) * 2 - 1;
    return Math.min(bitsLat, bitsLongNorth, bitsLongSouth, MAXIMUM_BITS_PRECISION);
}
/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param center The center given as Firestore GeoPoint.
 * @param radius The radius of the circle.
 * @returns The eight bounding box points.
 */
function boundingBoxCoordinates(center, radius) {
    var latDegrees = radius / METERS_PER_DEGREE_LATITUDE;
    var latitudeNorth = Math.min(90, center.latitude + latDegrees);
    var latitudeSouth = Math.max(-90, center.latitude - latDegrees);
    var longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
    var longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
    var longDegs = Math.max(longDegsNorth, longDegsSouth);
    return [
        toGeoPoint(center.latitude, center.longitude),
        toGeoPoint(center.latitude, wrapLongitude(center.longitude - longDegs)),
        toGeoPoint(center.latitude, wrapLongitude(center.longitude + longDegs)),
        toGeoPoint(latitudeNorth, center.longitude),
        toGeoPoint(latitudeNorth, wrapLongitude(center.longitude - longDegs)),
        toGeoPoint(latitudeNorth, wrapLongitude(center.longitude + longDegs)),
        toGeoPoint(latitudeSouth, center.longitude),
        toGeoPoint(latitudeSouth, wrapLongitude(center.longitude - longDegs)),
        toGeoPoint(latitudeSouth, wrapLongitude(center.longitude + longDegs))
    ];
}
/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param geohash The geohash whose bounding box query to generate.
 * @param bits The number of bits of precision.
 * @returns A [start, end] pair of geohashes.
 */
function geohashQuery(geohash, bits) {
    validateGeohash(geohash);
    var precision = Math.ceil(bits / BITS_PER_CHAR);
    if (geohash.length < precision) {
        return [geohash, geohash + '~'];
    }
    geohash = geohash.substring(0, precision);
    var base = geohash.substring(0, geohash.length - 1);
    var lastValue = BASE32.indexOf(geohash.charAt(geohash.length - 1));
    var significantBits = bits - (base.length * BITS_PER_CHAR);
    var unusedBits = (BITS_PER_CHAR - significantBits);
    // delete unused bits
    var startValue = (lastValue >> unusedBits) << unusedBits;
    var endValue = startValue + (1 << unusedBits);
    if (endValue > 31) {
        return [base + BASE32[startValue], base + '~'];
    }
    else {
        return [base + BASE32[startValue], base + BASE32[endValue]];
    }
}
/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param center The center given as a GeoPoint.
 * @param radius The radius of the circle.
 * @return An array of geohashes containing a GeoPoint.
 */
function geohashQueries(center, radius) {
    validateLocation(center);
    var queryBits = Math.max(1, boundingBoxBits(center, radius));
    var geohashPrecision = Math.ceil(queryBits / BITS_PER_CHAR);
    var coordinates = boundingBoxCoordinates(center, radius);
    var queries = coordinates.map(function (coordinate) {
        return geohashQuery(encodeGeohash(coordinate, geohashPrecision), queryBits);
    });
    // remove duplicates
    return queries.filter(function (query, index) {
        return !queries.some(function (other, otherIndex) {
            return index > otherIndex && query[0] === other[0] && query[1] === other[1];
        });
    });
}
/**
 * Encodes a location and geohash as a GeoFire object.
 *
 * @param location The location as [latitude, longitude] pair.
 * @param geohash The geohash of the location.
 * @returns The location encoded as GeoFire object.
 */
function encodeGeoFireObject(location, geohash, document) {
    validateLocation(location);
    validateGeohash(geohash);
    return { g: geohash, l: location, d: document };
}
/**
 * Decodes the document given as GeoFirestore object. Returns null if decoding fails.
 *
 * @param geoFirestoreObj The document encoded as GeoFirestore object.
 * @returns The Firestore document or null if decoding fails.
 */
function decodeGeoFirestoreObject(geoFirestoreObj) {
    if (validateGeoFirestoreObject(geoFirestoreObj, true)) {
        return geoFirestoreObj.d;
    }
    else {
        throw new Error('Unexpected location object encountered: ' + JSON.stringify(geoFirestoreObj));
    }
}
/**
 * Returns the id of a Firestore snapshot across SDK versions.
 *
 * @param snapshot A Firestore snapshot.
 * @returns The Firestore snapshot's id.
 */
function geoFirestoreGetKey(snapshot) {
    var id;
    if (typeof snapshot.id === 'string' || snapshot.id === null) {
        id = snapshot.id;
    }
    return id;
}
/**
 * Returns the key of a document that is a GeoPoint.
 *
 * @param document A GeoFirestore document.
 * @returns The key for the location field of a document.
 */
function findCoordinatesKey(document, customKey) {
    var error;
    var key;
    if (document && typeof document === 'object') {
        if (customKey && customKey in document) {
            key = customKey;
        }
        else if ('coordinates' in document) {
            key = 'coordinates';
        }
        else {
            error = 'no valid key exists';
        }
    }
    else {
        error = 'document not an object';
    }
    if (key && !validateLocation(document[key], true)) {
        error = key + ' is not a valid GeoPoint';
    }
    if (error) {
        throw new Error('Invalid GeoFirestore document: ' + error);
    }
    return key;
}
/**
 * Returns a "GeoPoint." (Kind of fake, but get's the job done!)
 *
 * @param latitude Latitude for GeoPoint.
 * @param longitude Longitude for GeoPoint.
 * @returns Firestore "GeoPoint"
 */
function toGeoPoint(latitude, longitude) {
    var fakeGeoPoint = { latitude: latitude, longitude: longitude };
    validateLocation(fakeGeoPoint);
    return fakeGeoPoint;
}

/**
 * Creates a GeoFirestoreQuery instance.
 */
var GeoFirestoreQuery = /** @class */ (function () {
    /**
     * @param _collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
     * @param queryCriteria The criteria which specifies the query's center and radius.
     */
    function GeoFirestoreQuery(_collectionRef, queryCriteria) {
        var _this = this;
        this._collectionRef = _collectionRef;
        // Event callbacks
        this._callbacks = { ready: [], key_entered: [], key_exited: [], key_moved: [], key_modified: [] };
        // Variable to track when the query is cancelled
        this._cancelled = false;
        // A Map of geohash queries which currently have an active callbacks
        this._currentGeohashesQueried = new Map();
        // A Map of locations that a currently active in the queries
        // Note that not all of these are currently within this query
        this._locationsTracked = new Map();
        // Variables used to keep track of when to fire the 'ready' event
        this._valueEventFired = false;
        this._geohashCleanupScheduled = false;
        // Firebase reference of the GeoFirestore which created this query
        if (Object.prototype.toString.call(this._collectionRef) !== '[object Object]') {
            throw new Error('firebaseRef must be an instance of Firestore');
        }
        // Every ten seconds, clean up the geohashes we are currently querying for. We keep these around
        // for a little while since it's likely that they will need to be re-queried shortly after they
        // move outside of the query's bounding box.
        this._cleanUpCurrentGeohashesQueriedInterval = setInterval(function () {
            if (_this._geohashCleanupScheduled === false) {
                _this._cleanUpCurrentGeohashesQueried();
            }
        }, 10000);
        // Validate and save the query criteria
        validateCriteria(queryCriteria, true);
        this._center = queryCriteria.center;
        this._radius = queryCriteria.radius;
        this._query = (queryCriteria.query) ? queryCriteria.query(this._collectionRef) : this._collectionRef;
        // Listen for new geohashes being added around this query and fire the appropriate events
        this._listenForNewGeohashes();
    }
    /********************/
    /*  PUBLIC METHODS  */
    /********************/
    /**
     * Terminates this query so that it no longer sends location updates. All callbacks attached to this
     * query via on() will be cancelled. This query can no longer be used in the future.
     */
    GeoFirestoreQuery.prototype.cancel = function () {
        var _this = this;
        // Mark this query as cancelled
        this._cancelled = true;
        // Cancel all callbacks in this query's callback list
        this._callbacks = { ready: [], key_entered: [], key_exited: [], key_moved: [], key_modified: [] };
        // Turn off all Firebase listeners for the current geohashes being queried
        var keys = Array.from(this._currentGeohashesQueried.keys());
        keys.forEach(function (geohashQueryStr) {
            _this._cancelGeohashQuery(_this._currentGeohashesQueried.get(geohashQueryStr));
            _this._currentGeohashesQueried.delete(geohashQueryStr);
        });
        // Delete any stored locations
        this._locationsTracked = new Map();
        // Turn off the current geohashes queried clean up interval
        clearInterval(this._cleanUpCurrentGeohashesQueriedInterval);
    };
    /**
     * Returns the location signifying the center of this query.
     *
     * @returns The GeoPoint signifying the center of this query.
     */
    GeoFirestoreQuery.prototype.center = function () {
        return this._center;
    };
    /**
     * Attaches a callback to this query which will be run when the provided eventType fires. Valid eventType
     * values are 'ready', 'key_entered', 'key_exited', 'key_moved', and 'key_modified'. The ready event callback
     * is passed no parameters. All other callbacks will be passed three parameters: (1) the location's key, (2)
     * the location's document, and (3) the distance, in kilometers, from the location to this query's center
     *
     * 'ready' is used to signify that this query has loaded its initial state and is up-to-date with its corresponding
     * GeoFirestore instance. 'ready' fires when this query has loaded all of the initial data from GeoFirestore and fired all
     * other events for that data. It also fires every time updateCriteria() is called, after all other events have
     * fired for the updated query.
     *
     * 'key_entered' fires when a key enters this query. This can happen when a key moves from a location outside of
     * this query to one inside of it or when a key is written to GeoFirestore for the first time and it falls within
     * this query.
     *
     * 'key_exited' fires when a key moves from a location inside of this query to one outside of it. If the key was
     * entirely removed from GeoFire, both the location and distance passed to the callback will be null.
     *
     * 'key_moved' fires when a key which is already in this query moves to another location inside of it.
     *
     * 'key_modified' fires when a key which is already in this query and the document has changed, while the location has stayed the same.
     *
     * Returns a GeoCallbackRegistration which can be used to cancel the callback. You can add as many callbacks
     * as you would like for the same eventType by repeatedly calling on(). Each one will get called when its
     * corresponding eventType fires. Each callback must be cancelled individually.
     *
     * @param eventType The event type for which to attach the callback. One of 'ready', 'key_entered',
     * 'key_exited', 'key_moved', or 'key_modified'.
     * @param callback Callback function to be called when an event of type eventType fires.
     * @returns A callback registration which can be used to cancel the provided callback.
     */
    GeoFirestoreQuery.prototype.on = function (eventType, callback) {
        var _this = this;
        // Validate the inputs
        if (['ready', 'key_entered', 'key_exited', 'key_moved', 'key_modified'].indexOf(eventType) === -1) {
            throw new Error('event type must be \'ready\', \'key_entered\', \'key_exited\', \'key_moved\', or \'key_modified\'');
        }
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        }
        // Add the callback to this query's callbacks list
        this._callbacks[eventType].push(callback);
        // If this is a 'key_entered' callback, fire it for every location already within this query
        if (eventType === 'key_entered') {
            this._locationsTracked.forEach(function (locationMap, key) {
                if (typeof locationMap !== 'undefined' && locationMap.isInQuery) {
                    var keyCallback = callback;
                    keyCallback(key, locationMap.document, locationMap.distanceFromCenter);
                }
            });
        }
        // If this is a 'ready' callback, fire it if this query is already ready
        if (eventType === 'ready' && this._valueEventFired) {
            callback();
        }
        // Return an event registration which can be used to cancel the callback
        return new GeoCallbackRegistration(function () {
            _this._callbacks[eventType].splice(_this._callbacks[eventType].indexOf(callback), 1);
        });
    };
    /**
     * Returns Firestore query.
     *
     * @returns The Firestore query.
     */
    GeoFirestoreQuery.prototype.query = function () {
        return this._query;
    };
    /**
     * Returns the radius of this query, in kilometers.
     *
     * @returns The radius of this query, in kilometers.
     */
    GeoFirestoreQuery.prototype.radius = function () {
        return this._radius;
    };
    /**
     * Updates the criteria for this query.
     *
     * @param newQueryCriteria The criteria which specifies the query's center and radius.
     */
    GeoFirestoreQuery.prototype.updateCriteria = function (newQueryCriteria) {
        // Validate and save the new query criteria
        validateCriteria(newQueryCriteria);
        this._center = newQueryCriteria.center || this._center;
        this._radius = newQueryCriteria.radius || this._radius;
        this._query = (newQueryCriteria.query) ? newQueryCriteria.query(this._collectionRef) : this._query;
        if (Object.prototype.toString.call(newQueryCriteria.query) === '[object Null]') {
            this._query = this._collectionRef;
        }
        // Loop through all of the locations in the query, update their distance from the center of the query, and fire any appropriate events
        var keys = Array.from(this._locationsTracked.keys());
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            // If the query was cancelled while going through this loop, stop updating locations and stop firing events
            if (this._cancelled === true) {
                break;
            }
            // Get the cached information for this location
            var locationMap = this._locationsTracked.get(key);
            // Save if the location was already in the query
            var wasAlreadyInQuery = locationMap.isInQuery;
            // Update the location's distance to the new query center
            locationMap.distanceFromCenter = GeoFirestore.distance(locationMap.location, this._center);
            // Determine if the location is now in this query
            locationMap.isInQuery = (locationMap.distanceFromCenter <= this._radius);
            // If the location just left the query, fire the 'key_exited' callbacks
            // Else if the location just entered the query, fire the 'key_entered' callbacks
            if (wasAlreadyInQuery && !locationMap.isInQuery) {
                this._fireCallbacksForKey('key_exited', key, locationMap.document, locationMap.distanceFromCenter);
            }
            else if (!wasAlreadyInQuery && locationMap.isInQuery) {
                this._fireCallbacksForKey('key_entered', key, locationMap.document, locationMap.distanceFromCenter);
            }
        }
        // Reset the variables which control when the 'ready' event fires
        this._valueEventFired = false;
        // Listen for new geohashes being added to GeoFirestore and fire the appropriate events
        this._listenForNewGeohashes();
    };
    /*********************/
    /*  PRIVATE METHODS  */
    /*********************/
    /**
     * Turns off all callbacks for the provide geohash query.
     *
     * @param queryState An object storing the current state of the query.
     */
    GeoFirestoreQuery.prototype._cancelGeohashQuery = function (queryState) {
        queryState.childCallback();
        queryState.valueCallback();
    };
    /**
     * Callback for child added events.
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    GeoFirestoreQuery.prototype._childAddedCallback = function (locationDataSnapshot) {
        var data = (locationDataSnapshot.exists) ? locationDataSnapshot.data() : null;
        var document = (data && validateGeoFirestoreObject(data)) ? data.d : null;
        var location = (data && validateLocation(data.l)) ? data.l : null;
        var snapshot = locationDataSnapshot;
        this._updateLocation(geoFirestoreGetKey(locationDataSnapshot), location, document, null, snapshot);
    };
    /**
     * Callback for child changed events
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    GeoFirestoreQuery.prototype._childChangedCallback = function (locationDataSnapshot) {
        var data = (locationDataSnapshot.exists) ? locationDataSnapshot.data() : null;
        var document = (data && validateGeoFirestoreObject(data)) ? data.d : null;
        var location = (data && validateLocation(data.l)) ? data.l : null;
        this._updateLocation(geoFirestoreGetKey(locationDataSnapshot), location, document, true);
    };
    /**
     * Callback for child removed events
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    GeoFirestoreQuery.prototype._childRemovedCallback = function (locationDataSnapshot) {
        var _this = this;
        var $key = geoFirestoreGetKey(locationDataSnapshot);
        if (this._locationsTracked.has($key)) {
            var promise = this._collectionRef.doc($key).get();
            promise.then(function (snapshot) {
                var data = (snapshot.exists) ? snapshot.data() : null;
                var document = (data && validateGeoFirestoreObject(data)) ? data.d : null;
                var location = (data && validateLocation(data.l)) ? data.l : null;
                var geohash = (location !== null) ? encodeGeohash(location) : null;
                // Only notify observers if key is not part of any other geohash query or this actually might not be
                // a key exited event, but a key moved or entered event. These events will be triggered by updates
                // to a different query
                if (!_this._geohashInSomeQuery(geohash)) {
                    _this._removeLocation($key, document);
                }
            });
        }
    };
    /**
     * Removes unnecessary Firebase queries which are currently being queried.
     */
    GeoFirestoreQuery.prototype._cleanUpCurrentGeohashesQueried = function () {
        var _this = this;
        var keys = Array.from(this._currentGeohashesQueried.keys());
        keys.forEach(function (geohashQueryStr) {
            var queryState = _this._currentGeohashesQueried.get(geohashQueryStr);
            if (queryState.active === false) {
                // Delete the geohash since it should no longer be queried
                _this._cancelGeohashQuery(queryState);
                _this._currentGeohashesQueried.delete(geohashQueryStr);
            }
        });
        // Delete each location which should no longer be queried
        keys = Array.from(this._locationsTracked.keys());
        keys.forEach(function (key) {
            if (!_this._geohashInSomeQuery(_this._locationsTracked.get(key).geohash)) {
                if (_this._locationsTracked.get(key).isInQuery) {
                    throw new Error('Internal State error, trying to remove location that is still in query');
                }
                _this._locationsTracked.delete(key);
            }
        });
        // Specify that this is done cleaning up the current geohashes queried
        this._geohashCleanupScheduled = false;
        // Cancel any outstanding scheduled cleanup
        if (this._cleanUpCurrentGeohashesQueriedTimeout !== null) {
            clearTimeout(this._cleanUpCurrentGeohashesQueriedTimeout);
            this._cleanUpCurrentGeohashesQueriedTimeout = null;
        }
    };
    /**
     * Fires each callback for the provided eventType, passing it provided key's data.
     *
     * @param eventType The event type whose callbacks to fire. One of 'key_entered', 'key_exited', 'key_moved', or 'key_modified'.
     * @param key The key of the location for which to fire the callbacks.
     * @param document The document from the GeoFirestore Collection.
     * @param distanceFromCenter The distance from the center or null.
     */
    GeoFirestoreQuery.prototype._fireCallbacksForKey = function (eventType, key, document, distanceFromCenter, snapshot) {
        this._callbacks[eventType].forEach(function (callback) {
            if (typeof document === 'undefined' || document === null) {
                callback(key, null, null);
            }
            else {
                callback(key, document, distanceFromCenter, snapshot);
            }
        });
    };
    /**
     * Fires each callback for the 'ready' event.
     */
    GeoFirestoreQuery.prototype._fireReadyEventCallbacks = function () {
        this._callbacks.ready.forEach(function (callback) {
            callback();
        });
    };
    /**
     * Checks if this geohash is currently part of any of the geohash queries.
     *
     * @param geohash The geohash.
     * @returns Returns true if the geohash is part of any of the current geohash queries.
     */
    GeoFirestoreQuery.prototype._geohashInSomeQuery = function (geohash) {
        var keys = Array.from(this._currentGeohashesQueried.keys());
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var queryStr = keys_2[_i];
            if (this._currentGeohashesQueried.has(queryStr)) {
                var query = this._stringToQuery(queryStr);
                if (geohash >= query[0] && geohash <= query[1]) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Called once all geohash queries have received all child added events and fires the ready
     * event if necessary.
     */
    GeoFirestoreQuery.prototype._geohashQueryReadyCallback = function (queryStr) {
        var index = this._outstandingGeohashReadyEvents.indexOf(queryStr);
        if (index > -1) {
            this._outstandingGeohashReadyEvents.splice(index, 1);
        }
        this._valueEventFired = (this._outstandingGeohashReadyEvents.length === 0);
        // If all queries have been processed, fire the ready event
        if (this._valueEventFired) {
            this._fireReadyEventCallbacks();
        }
    };
    /**
     * Attaches listeners to Firebase which track when new geohashes are added within this query's
     * bounding box.
     */
    GeoFirestoreQuery.prototype._listenForNewGeohashes = function () {
        var _this = this;
        // Get the list of geohashes to query
        var geohashesToQuery = geohashQueries(this._center, this._radius * 1000).map(this._queryToString);
        // Filter out duplicate geohashes
        geohashesToQuery = geohashesToQuery.filter(function (geohash, i) { return geohashesToQuery.indexOf(geohash) === i; });
        // For all of the geohashes that we are already currently querying, check if they are still
        // supposed to be queried. If so, don't re-query them. Otherwise, mark them to be un-queried
        // next time we clean up the current geohashes queried map.
        this._currentGeohashesQueried.forEach(function (value, key) {
            var index = geohashesToQuery.indexOf(key);
            if (index === -1) {
                value.active = false;
            }
            else {
                value.active = true;
                geohashesToQuery.splice(index, 1);
            }
        });
        // If we are not already cleaning up the current geohashes queried and we have more than 25 of them,
        // kick off a timeout to clean them up so we don't create an infinite number of unneeded queries.
        if (this._geohashCleanupScheduled === false && this._currentGeohashesQueried.size > 25) {
            this._geohashCleanupScheduled = true;
            this._cleanUpCurrentGeohashesQueriedTimeout = setTimeout(this._cleanUpCurrentGeohashesQueried, 10);
        }
        // Keep track of which geohashes have been processed so we know when to fire the 'ready' event
        this._outstandingGeohashReadyEvents = geohashesToQuery.slice();
        // Loop through each geohash to query for and listen for new geohashes which have the same prefix.
        // For every match, attach a value callback which will fire the appropriate events.
        // Once every geohash to query is processed, fire the 'ready' event.
        geohashesToQuery.forEach(function (toQueryStr) {
            // decode the geohash query string
            var query = _this._stringToQuery(toQueryStr);
            // Create the Firebase query
            var firestoreQuery = _this._query.orderBy('g').startAt(query[0]).endAt(query[1]);
            // For every new matching geohash, determine if we should fire the 'key_entered' event
            var childCallback = firestoreQuery.onSnapshot(function (snapshot) {
                var docChanges = (typeof snapshot.docChanges === 'function') ? snapshot.docChanges() : snapshot.docChanges;
                docChanges.forEach(function (change) {
                    if (change.type === 'added') {
                        _this._childAddedCallback(change.doc);
                    }
                    if (change.type === 'modified') {
                        _this._childChangedCallback(change.doc);
                    }
                    if (change.type === 'removed') {
                        _this._childRemovedCallback(change.doc);
                    }
                });
                // Once the current geohash to query is processed, see if it is the last one to be processed
                // and, if so, mark the value event as fired.
                // Note that Firebase fires the 'value' event after every 'added' event fires.
                var valueCallback = firestoreQuery.onSnapshot(function () {
                    valueCallback();
                    _this._geohashQueryReadyCallback(toQueryStr);
                });
                // Add the geohash query to the current geohashes queried map and save its state
                _this._currentGeohashesQueried.set(toQueryStr, {
                    active: true,
                    childCallback: childCallback,
                    valueCallback: valueCallback
                });
            });
        });
        // Based upon the algorithm to calculate geohashes, it's possible that no 'new'
        // geohashes were queried even if the client updates the radius of the query.
        // This results in no 'READY' event being fired after the .updateCriteria() call.
        // Check to see if this is the case, and trigger the 'READY' event.
        if (geohashesToQuery.length === 0) {
            this._geohashQueryReadyCallback();
        }
    };
    /**
     * Encodes a query as a string for easier indexing and equality.
     *
     * @param query The query to encode.
     * @returns The encoded query as string.
     */
    GeoFirestoreQuery.prototype._queryToString = function (query) {
        if (query.length !== 2) {
            throw new Error('Not a valid geohash query: ' + query);
        }
        return query[0] + ':' + query[1];
    };
    /**
     * Removes the document/location from the local state and fires any events if necessary.
     *
     * @param $key The key to be removed.
     * @param document The current Document from Firestore, or null if removed.
     */
    GeoFirestoreQuery.prototype._removeLocation = function ($key, document) {
        var locationMap = this._locationsTracked.get($key);
        this._locationsTracked.delete($key);
        if (typeof locationMap !== 'undefined' && locationMap.isInQuery) {
            var locationKey = (document) ? findCoordinatesKey(document) : null;
            var location_1 = (locationKey) ? document[locationKey] : null;
            var distanceFromCenter = (location_1) ? GeoFirestore.distance(location_1, this._center) : null;
            this._fireCallbacksForKey('key_exited', $key, document, distanceFromCenter);
        }
    };
    /**
     * Decodes a query string to a query
     *
     * @param str The encoded query.
     * @returns The decoded query as a [start, end] pair.
     */
    GeoFirestoreQuery.prototype._stringToQuery = function (str) {
        var decoded = str.split(':');
        if (decoded.length !== 2) {
            throw new Error('Invalid internal state! Not a valid geohash query: ' + str);
        }
        return decoded;
    };
    /**
     * Callback for any updates to locations. Will update the information about a key and fire any necessary
     * events every time the key's location changes.
     *
     * When a key is removed from GeoFirestore or the query, this function will be called with null and performs
     * any necessary cleanup.
     *
     * @param key The key of the GeoFirestore location.
     * @param location The location as a Firestore GeoPoint.
     * @param document The current Document from Firestore.
     * @param modified Flag for if document is a modified document/
     */
    GeoFirestoreQuery.prototype._updateLocation = function (key, location, document, modified, snapshot) {
        if (modified === void 0) { modified = false; }
        validateLocation(location);
        // Get the key and location
        var distanceFromCenter, isInQuery;
        var wasInQuery = (this._locationsTracked.has(key)) ? this._locationsTracked.get(key).isInQuery : false;
        var oldLocation = (this._locationsTracked.has(key)) ? this._locationsTracked.get(key).location : null;
        // Determine if the location is within this query
        distanceFromCenter = GeoFirestore.distance(location, this._center);
        isInQuery = (distanceFromCenter <= this._radius);
        // Add this location to the locations queried map even if it is not within this query
        this._locationsTracked.set(key, {
            distanceFromCenter: distanceFromCenter,
            document: document,
            geohash: encodeGeohash(location),
            isInQuery: isInQuery,
            location: location,
            snapshot: snapshot
        });
        // Fire the 'key_entered' event if the provided key has entered this query
        if (isInQuery && !wasInQuery) {
            this._fireCallbacksForKey('key_entered', key, document, distanceFromCenter, snapshot);
        }
        else if (isInQuery && oldLocation !== null && (location.latitude !== oldLocation.latitude || location.longitude !== oldLocation.longitude)) {
            this._fireCallbacksForKey('key_moved', key, document, distanceFromCenter);
        }
        else if (!isInQuery && wasInQuery) {
            this._fireCallbacksForKey('key_exited', key, document, distanceFromCenter);
        }
        else if (isInQuery && modified) {
            this._fireCallbacksForKey('key_modified', key, document, distanceFromCenter);
        }
    };
    return GeoFirestoreQuery;
}());

/**
 * Creates a GeoFirestore instance.
 */
var GeoFirestore = /** @class */ (function () {
    /**
     * @param collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
     */
    function GeoFirestore(_collectionRef) {
        this._collectionRef = _collectionRef;
        if (Object.prototype.toString.call(this._collectionRef) !== '[object Object]') {
            throw new Error('collectionRef must be an instance of a Firestore Collection');
        }
        this._isWeb = Object.prototype.toString.call(this._collectionRef.firestore.enablePersistence) === '[object Function]';
    }
    /********************/
    /*  PUBLIC METHODS  */
    /********************/
    /**
     * Adds document to Firestore. Returns a promise which is fulfilled when the write is complete.
     *
     * @param document The document to be added to the GeoFirestore.
     * @param customKey The key of the document to use as the location. Otherwise we default to `coordinates`.
     * @returns A promise that is fulfilled when the write is complete.
     */
    GeoFirestore.prototype.add = function (document, customKey) {
        if (Object.prototype.toString.call(document) === '[object Object]') {
            var locationKey = findCoordinatesKey(document, customKey);
            var location_1 = document[locationKey];
            var geohash = encodeGeohash(location_1);
            return this._collectionRef.add(encodeGeoFireObject(location_1, geohash, document));
        }
        else {
            throw new Error('document must be an object');
        }
    };
    /**
     * Returns a promise fulfilled with the document corresponding to the provided key.
     *
     * If the provided key does not exist, the returned promise is fulfilled with null.
     *
     * @param $key The key of the location to retrieve.
     * @param options Describes whether we should get from server or cache.
     * @returns A promise that is fulfilled with the document of the given key.
     */
    GeoFirestore.prototype.get = function ($key, options) {
        if (options === void 0) { options = { source: 'default' }; }
        validateKey($key);
        var documentReference = this._collectionRef.doc($key);
        var promise = this._isWeb ? documentReference.get(options) : documentReference.get();
        return promise.then(function (documentSnapshot) {
            if (!documentSnapshot.exists) {
                return null;
            }
            else {
                var snapshotVal = documentSnapshot.data();
                return decodeGeoFirestoreObject(snapshotVal);
            }
        });
    };
    /**
     * Returns the Firestore Collection used to create this GeoFirestore instance.
     *
     * @returns The Firestore Collection used to create this GeoFirestore instance.
     */
    GeoFirestore.prototype.ref = function () {
        return this._collectionRef;
    };
    /**
     * Removes the provided key, or keys, from this GeoFirestore. Returns an empty promise fulfilled when the key(s) has been removed.
     *
     * If the provided key(s) is not in this GeoFirestore, the promise will still successfully resolve.
     *
     * @param keyOrKeys The key representing the document to remove or an array of keys to remove.
     * @returns A promise that is fulfilled after the inputted key(s) is removed.
     */
    GeoFirestore.prototype.remove = function (keyOrKeys) {
        if (Array.isArray(keyOrKeys)) {
            var documents_1 = {};
            keyOrKeys.forEach(function (key) { documents_1[key] = null; });
            return this.set(documents_1);
        }
        else {
            return this.set(keyOrKeys);
        }
    };
    /**
     * Adds the provided key - location pair(s) to Firestore. Returns an empty promise which is fulfilled when the write is complete.
     *
     * If any provided key already exists in this GeoFirestore, it will be overwritten with the new location value.
     *
     * @param keyOrDocuments The key representing the document to add or an object of $key - document pairs.
     * @param document The document to be added to the GeoFirestore.
     * @param customKey The key of the document to use as the location. Otherwise we default to `coordinates`.
     * @returns A promise that is fulfilled when the write is complete.
     */
    GeoFirestore.prototype.set = function (keyOrDocuments, document, customKey) {
        var _this = this;
        if (typeof keyOrDocuments === 'string' && keyOrDocuments.length !== 0) {
            validateKey(keyOrDocuments);
            if (!document) {
                // Setting location to null is valid since it will remove the key
                return this._collectionRef.doc(keyOrDocuments).delete();
            }
            else {
                var locationKey = findCoordinatesKey(document, customKey);
                var location_2 = document[locationKey];
                var geohash = encodeGeohash(location_2);
                return this._collectionRef.doc(keyOrDocuments).set(encodeGeoFireObject(location_2, geohash, document));
            }
        }
        else if (typeof keyOrDocuments === 'object') {
            if (typeof document !== 'undefined') {
                throw new Error('The location argument should not be used if you pass an object to set().');
            }
        }
        else {
            throw new Error('keyOrDocuments must be a string or a mapping of key - document pairs.');
        }
        var batch = this._collectionRef.firestore.batch();
        Object.keys(keyOrDocuments).forEach(function (key) {
            validateKey(key);
            var ref = _this._collectionRef.doc(key);
            var documentToUpdate = keyOrDocuments[key];
            if (!documentToUpdate) {
                batch.delete(ref);
            }
            else {
                var locationKey = findCoordinatesKey(documentToUpdate, customKey);
                var location_3 = documentToUpdate[locationKey];
                var geohash = encodeGeohash(location_3);
                batch.set(ref, encodeGeoFireObject(location_3, geohash, documentToUpdate), { merge: true });
            }
        });
        return batch.commit();
    };
    /**
     * Returns a new GeoQuery instance with the provided queryCriteria.
     *
     * @param queryCriteria The criteria which specifies the GeoQuery's center and radius.
     * @return A new GeoFirestoreQuery object.
     */
    GeoFirestore.prototype.query = function (queryCriteria) {
        return new GeoFirestoreQuery(this._collectionRef, queryCriteria);
    };
    /********************/
    /*  STATIC METHODS  */
    /********************/
    /**
     * Static method which calculates the distance, in kilometers, between two locations,
     * via the Haversine formula. Note that this is approximate due to the fact that the
     * Earth's radius varies between 6356.752 km and 6378.137 km.
     *
     * @param location1 The GeoPoint of the first location.
     * @param location2 The GeoPoint of the second location.
     * @returns The distance, in kilometers, between the inputted locations.
     */
    GeoFirestore.distance = function (location1, location2) {
        validateLocation(location1);
        validateLocation(location2);
        var radius = 6371; // Earth's radius in kilometers
        var latDelta = degreesToRadians(location2.latitude - location1.latitude);
        var lonDelta = degreesToRadians(location2.longitude - location1.longitude);
        var a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
            (Math.cos(degreesToRadians(location1.latitude)) * Math.cos(degreesToRadians(location2.latitude)) *
                Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    };
    GeoFirestore.encodeGeohash = function (coordinate, geohashPrecision) {
      var geohash = encodeGeohash(coordinate, geohashPrecision);
      return geohash;
    };
    return GeoFirestore;
}());

exports.GeoCallbackRegistration = GeoCallbackRegistration;
exports.GeoFirestore = GeoFirestore;
exports.GeoFirestoreQuery = GeoFirestoreQuery;
exports.encodeGeohash = encodeGeohash;
