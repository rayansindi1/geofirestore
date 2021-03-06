import { GeoFirestoreQuery } from './query';
import { firestore, QueryCriteria } from './interfaces';
/**
 * Creates a GeoFirestore instance.
 */
export declare class GeoFirestore {
    private _collectionRef;
    private _isWeb;
    /**
     * @param collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
     */
    constructor(_collectionRef: firestore.CollectionReference | firestore.cloud.CollectionReference);
    /********************/
    /********************/
    /**
     * Adds document to Firestore. Returns a promise which is fulfilled when the write is complete.
     *
     * @param document The document to be added to the GeoFirestore.
     * @param customKey The key of the document to use as the location. Otherwise we default to `coordinates`.
     * @returns A promise that is fulfilled when the write is complete.
     */
    add(document: any, customKey?: string): Promise<firestore.DocumentReference | firestore.cloud.DocumentReference>;
    /**
     * Returns a promise fulfilled with the document corresponding to the provided key.
     *
     * If the provided key does not exist, the returned promise is fulfilled with null.
     *
     * @param $key The key of the location to retrieve.
     * @param options Describes whether we should get from server or cache.
     * @returns A promise that is fulfilled with the document of the given key.
     */
    get($key: string, options?: firestore.GetOptions): Promise<any>;
    /**
     * Returns the Firestore Collection used to create this GeoFirestore instance.
     *
     * @returns The Firestore Collection used to create this GeoFirestore instance.
     */
    ref(): firestore.CollectionReference | firestore.cloud.CollectionReference;
    /**
     * Removes the provided key, or keys, from this GeoFirestore. Returns an empty promise fulfilled when the key(s) has been removed.
     *
     * If the provided key(s) is not in this GeoFirestore, the promise will still successfully resolve.
     *
     * @param keyOrKeys The key representing the document to remove or an array of keys to remove.
     * @returns A promise that is fulfilled after the inputted key(s) is removed.
     */
    remove(keyOrKeys: string | string[]): Promise<any>;
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
    set(keyOrDocuments: string | any, document?: any, customKey?: string): Promise<any>;
    /**
     * Returns a new GeoQuery instance with the provided queryCriteria.
     *
     * @param queryCriteria The criteria which specifies the GeoQuery's center and radius.
     * @return A new GeoFirestoreQuery object.
     */
    query(queryCriteria: QueryCriteria): GeoFirestoreQuery;
    /********************/
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
    static distance(location1: firestore.GeoPoint | firestore.cloud.GeoPoint, location2: firestore.GeoPoint | firestore.cloud.GeoPoint): number;
}
