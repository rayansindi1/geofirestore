import { firestore, GeoFirestoreObj, QueryCriteria } from './interfaces';
export declare const GEOHASH_PRECISION = 10;
export declare const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
export declare const EARTH_MERI_CIRCUMFERENCE = 40007860;
export declare const METERS_PER_DEGREE_LATITUDE = 110574;
export declare const BITS_PER_CHAR = 5;
export declare const MAXIMUM_BITS_PRECISION: number;
export declare const EARTH_EQ_RADIUS = 6378137;
export declare const E2 = 0.00669447819799;
export declare const EPSILON = 1e-12;
/**
 * Validates the inputted key and throws an error, or returns boolean, if it is invalid.
 *
 * @param key The key to be verified.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
export declare function validateKey(key: string, flag?: boolean): boolean;
/**
 * Validates the inputted location and throws an error, or returns boolean, if it is invalid.
 *
 * @param location The Firestore GeoPoint to be verified.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
export declare function validateLocation(location: firestore.GeoPoint | firestore.cloud.GeoPoint, flag?: boolean): boolean;
/**
 * Validates the inputted geohash and throws an error, or returns boolean, if it is invalid.
 *
 * @param geohash The geohash to be validated.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
export declare function validateGeohash(geohash: string, flag?: boolean): boolean;
/**
 * Validates the inputted GeoFirestore object and throws an error, or returns boolean, if it is invalid.
 *
 * @param geoFirestoreObj The GeoFirestore object to be validated.
 * @param flag Tells function to send up boolean if valid instead of throwing an error.
 */
export declare function validateGeoFirestoreObject(geoFirestoreObj: GeoFirestoreObj, flag?: boolean): boolean;
/**
 * Validates the inputted query criteria and throws an error if it is invalid.
 *
 * @param newQueryCriteria The criteria which specifies the query's center and/or radius.
 * @param requireCenterAndRadius The criteria which center and radius required.
 */
export declare function validateCriteria(newQueryCriteria: QueryCriteria, requireCenterAndRadius?: boolean): void;
/**
 * Converts degrees to radians.
 *
 * @param degrees The number of degrees to be converted to radians.
 * @returns The number of radians equal to the inputted number of degrees.
 */
export declare function degreesToRadians(degrees: number): number;
/**
 * Generates a geohash of the specified precision/string length from the inputted GeoPoint.
 *
 * @param location The GeoPoint to encode into a geohash.
 * @param precision The length of the geohash to create. If no precision is specified, the
 * global default is used.
 * @returns The geohash of the inputted location.
 */
export declare function encodeGeohash(location: firestore.GeoPoint | firestore.cloud.GeoPoint, precision?: number): string;
/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param distance The distance to convert.
 * @param latitude The latitude at which to calculate.
 * @returns The number of degrees the distance corresponds to.
 */
export declare function metersToLongitudeDegrees(distance: number, latitude: number): number;
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param resolution The desired resolution.
 * @param latitude The latitude used in the conversion.
 * @return The bits necessary to reach a given resolution, in meters.
 */
export declare function longitudeBitsForResolution(resolution: number, latitude: number): number;
/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param resolution The bits necessary to reach a given resolution, in meters.
 * @returns Bits necessary to reach a given resolution, in meters, for the latitude.
 */
export declare function latitudeBitsForResolution(resolution: number): number;
/**
 * Wraps the longitude to [-180,180].
 *
 * @param longitude The longitude to wrap.
 * @returns longitude The resulting longitude.
 */
export declare function wrapLongitude(longitude: number): number;
/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param coordinate The coordinate as a Firestore GeoPoint.
 * @param size The size of the bounding box.
 * @returns The number of bits necessary for the geohash.
 */
export declare function boundingBoxBits(coordinate: firestore.GeoPoint | firestore.cloud.GeoPoint, size: number): number;
/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param center The center given as Firestore GeoPoint.
 * @param radius The radius of the circle.
 * @returns The eight bounding box points.
 */
export declare function boundingBoxCoordinates(center: firestore.GeoPoint | firestore.cloud.GeoPoint, radius: number): firestore.GeoPoint[] | firestore.cloud.GeoPoint[];
/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param geohash The geohash whose bounding box query to generate.
 * @param bits The number of bits of precision.
 * @returns A [start, end] pair of geohashes.
 */
export declare function geohashQuery(geohash: string, bits: number): string[];
/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param center The center given as a GeoPoint.
 * @param radius The radius of the circle.
 * @return An array of geohashes containing a GeoPoint.
 */
export declare function geohashQueries(center: firestore.GeoPoint | firestore.cloud.GeoPoint, radius: number): string[][];
/**
 * Encodes a location and geohash as a GeoFire object.
 *
 * @param location The location as [latitude, longitude] pair.
 * @param geohash The geohash of the location.
 * @returns The location encoded as GeoFire object.
 */
export declare function encodeGeoFireObject(location: firestore.GeoPoint | firestore.cloud.GeoPoint, geohash: string, document: any): GeoFirestoreObj;
/**
 * Decodes the document given as GeoFirestore object. Returns null if decoding fails.
 *
 * @param geoFirestoreObj The document encoded as GeoFirestore object.
 * @returns The Firestore document or null if decoding fails.
 */
export declare function decodeGeoFirestoreObject(geoFirestoreObj: GeoFirestoreObj): any;
/**
 * Returns the id of a Firestore snapshot across SDK versions.
 *
 * @param snapshot A Firestore snapshot.
 * @returns The Firestore snapshot's id.
 */
export declare function geoFirestoreGetKey(snapshot: firestore.DocumentSnapshot | firestore.cloud.DocumentSnapshot): string;
/**
 * Returns the key of a document that is a GeoPoint.
 *
 * @param document A GeoFirestore document.
 * @returns The key for the location field of a document.
 */
export declare function findCoordinatesKey(document: any, customKey?: string): string;
/**
 * Returns a "GeoPoint." (Kind of fake, but get's the job done!)
 *
 * @param latitude Latitude for GeoPoint.
 * @param longitude Longitude for GeoPoint.
 * @returns Firestore "GeoPoint"
 */
export declare function toGeoPoint(latitude: number, longitude: number): firestore.GeoPoint | firestore.cloud.GeoPoint;
