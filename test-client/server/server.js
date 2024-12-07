const storeController = require('./controllers/storeController');
const locationController = require('./controllers/locationController');

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.get('/api/:search/:radius', storeController.getStores, (req, res) => {
  res.json({ stores: res.locals.stores.businesses });
});
app.get('/location/:address', locationController.geocoder, (req, res) => {
  res.json({
    geocode: res.locals.geocode.geometry.location,
    check: res.locals.check,
  });
});

app.post('/api/location', locationController.currentLocation, (req, res) => {
  res.json({ places: res.locals.myLocation.places });
});

app.listen(3000, () => {
  console.log('listening on port 3000..');
});
