import { GeoCallbackRegistration } from './callbackRegistration';
import { firestore, KeyCallback, QueryCriteria, ReadyCallback } from './interfaces';
/**
 * Creates a GeoFirestoreQuery instance.
 */
export declare class GeoFirestoreQuery {
    private _collectionRef;
    private _callbacks;
    private _cancelled;
    private _center;
    private _currentGeohashesQueried;
    private _locationsTracked;
    private _radius;
    private _query;
    private _valueEventFired;
    private _outstandingGeohashReadyEvents;
    private _geohashCleanupScheduled;
    private _cleanUpCurrentGeohashesQueriedInterval;
    private _cleanUpCurrentGeohashesQueriedTimeout;
    /**
     * @param _collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
     * @param queryCriteria The criteria which specifies the query's center and radius.
     */
    constructor(_collectionRef: firestore.CollectionReference | firestore.cloud.CollectionReference, queryCriteria: QueryCriteria);
    /********************/
    /********************/
    /**
     * Terminates this query so that it no longer sends location updates. All callbacks attached to this
     * query via on() will be cancelled. This query can no longer be used in the future.
     */
    cancel(): void;
    /**
     * Returns the location signifying the center of this query.
     *
     * @returns The GeoPoint signifying the center of this query.
     */
    center(): firestore.GeoPoint | firestore.cloud.GeoPoint;
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
    on(eventType: string, callback: KeyCallback | ReadyCallback): GeoCallbackRegistration;
    /**
     * Returns Firestore query.
     *
     * @returns The Firestore query.
     */
    query(): firestore.Query | firestore.cloud.Query;
    /**
     * Returns the radius of this query, in kilometers.
     *
     * @returns The radius of this query, in kilometers.
     */
    radius(): number;
    /**
     * Updates the criteria for this query.
     *
     * @param newQueryCriteria The criteria which specifies the query's center and radius.
     */
    updateCriteria(newQueryCriteria: QueryCriteria): void;
    /*********************/
    /*********************/
    /**
     * Turns off all callbacks for the provide geohash query.
     *
     * @param queryState An object storing the current state of the query.
     */
    private _cancelGeohashQuery;
    /**
     * Callback for child added events.
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    private _childAddedCallback;
    /**
     * Callback for child changed events
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    private _childChangedCallback;
    /**
     * Callback for child removed events
     *
     * @param locationDataSnapshot A snapshot of the data stored for this location.
     */
    private _childRemovedCallback;
    /**
     * Removes unnecessary Firebase queries which are currently being queried.
     */
    private _cleanUpCurrentGeohashesQueried;
    /**
     * Fires each callback for the provided eventType, passing it provided key's data.
     *
     * @param eventType The event type whose callbacks to fire. One of 'key_entered', 'key_exited', 'key_moved', or 'key_modified'.
     * @param key The key of the location for which to fire the callbacks.
     * @param document The document from the GeoFirestore Collection.
     * @param distanceFromCenter The distance from the center or null.
     */
    private _fireCallbacksForKey;
    /**
     * Fires each callback for the 'ready' event.
     */
    private _fireReadyEventCallbacks;
    /**
     * Checks if this geohash is currently part of any of the geohash queries.
     *
     * @param geohash The geohash.
     * @returns Returns true if the geohash is part of any of the current geohash queries.
     */
    private _geohashInSomeQuery;
    /**
     * Called once all geohash queries have received all child added events and fires the ready
     * event if necessary.
     */
    private _geohashQueryReadyCallback;
    /**
     * Attaches listeners to Firebase which track when new geohashes are added within this query's
     * bounding box.
     */
    private _listenForNewGeohashes;
    /**
     * Encodes a query as a string for easier indexing and equality.
     *
     * @param query The query to encode.
     * @returns The encoded query as string.
     */
    private _queryToString;
    /**
     * Removes the document/location from the local state and fires any events if necessary.
     *
     * @param $key The key to be removed.
     * @param document The current Document from Firestore, or null if removed.
     */
    private _removeLocation;
    /**
     * Decodes a query string to a query
     *
     * @param str The encoded query.
     * @returns The decoded query as a [start, end] pair.
     */
    private _stringToQuery;
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
    private _updateLocation;
}
