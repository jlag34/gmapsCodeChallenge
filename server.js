const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const axios = require('axios');
const mapsKey = `AIzaSyD9V-vEzlpmnbizUVPcLsFKoMbiVP_6FBs`;

app.use(bodyParser.json());

const googleMapsClient = require('@google/maps').createClient({
  key: 'ADD_YOUR_API_KEY_HERE'
});

app.post('/api/distance', (request, response) => {
  const { locations } = request.body;
  // original instructions say metric is represented by 'si' but google looks for 'metric' as the variable
  // imperial is fine. use let to change unit value
  let { unit } = request.body;
  // change value from si to metic to get km
  unit = unit === 'si' ? 'metric' : unit;

  // handle if no array passed or array is empty for 'locations'
  if (!Array.isArray(locations) || locations.length === 0) {
    return response.status(400).send(JSON.stringify({ "error": "an array of locations was not passed" }));
  };

  // handle if 'si' or 'imperial' is not pass for 'units'
  if (unit !== 'metric' && unit !== 'imperial') {
    return response.status(400).send({ "error": "valid unit values are \"si\" and \"imperial\"" });
  }

  // capture all of the promises
  const allRequests = [];

  locations.forEach((location, key) => {
    if (key+1 >= locations.length) {
      return;
    }

    // remove commas, replace spaces with plus sign
    const loc = location.replace(/ /g, "+").replace(/,/g, "");
    const destination = locations[key+1].replace(/ /g, "+").replace(/,/g, "");

    const googleRoute = `https://maps.googleapis.com/maps/api/directions/json?units=${unit}&origin=${loc}&destination=${destination}&key=${mapsKey}`
    const axiosCall = axios.create({
      baseURL: googleRoute,
      method: 'get'
    });
    
    allRequests.push(axiosCall());
  });

  // handle all calls
  Promise.all(allRequests).then(trip => {
    let totalDistance = 0;

    // for each call add the the distance traveled to total
    trip.forEach(tripData => {
      totalDistance += tripData.data.routes[0].legs[0].distance.value;
    });
    
    // handle conversions
    if (unit === 'imperial') {
      // convert km to mi, round to one decimal
      const totalFormatted = Math.round(totalDistance*.001*0.62137*10)/10;
      return response.status(200).send({ "result": { "distance": totalFormatted, "unit": "miles" } });
    } else {
      // round to one decimal
      const totalFormatted = Math.round(totalDistance*.001*10)/10;
      return response.status(200).send({ "result": { "distance": totalFormatted, "unit": "kilometers" } });
    }
  });
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
})