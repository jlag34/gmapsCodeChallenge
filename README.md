# Distance Traveled API

Made in Node for a code challenge.

## Running App

`npm install`
`npm run dev`

## API Key

Please add your own API key from the Google Maps API. Look for designated area in `server.js`.

## Example Request

In a separate terminal run the following curl request:

```sh
curl -X POST -H 'Content-Type: application/json' 'http://localhost:3000/api/distance' \
-d '{ "locations": ["Boston MA", "New York City, New York", "Philadelphia, PA", "Charleston, NC"], "unit": "si" }'
```