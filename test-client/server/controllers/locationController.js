const locationController = {};

const apiKeyGoogle = 'AIzaSyDFTZBc7cfZnz--vR68vp3c7LvehM0ghe8';

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKeyGoogle,
    'X-Goog-FieldMask':
      'places.displayName,places.formattedAddress,places.primaryTypeDisplayName,places.photos,places.rating',
  },
};

locationController.currentLocation = async (req, res, next) => {
  // const requestBody = {
  //   textQuery: 'Black Owned',
  //   locationRestriction: {
  //     rectangle: {
  //       low: {
  //         latitude: center[0],
  //         longitude: center[1],
  //       },
  //       high: {
  //         latitude: center[0] - radius * 0.438805,
  //         longitude: center[1] - radius * 0.558889,
  //       },
  //     },
  //   },
  // };
  if (req.body.textQuery) {
    options.body = JSON.stringify(req.body);
  }
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      options
    );
    //console.log(response);
    res.locals.myLocation = await response.json();
    return next();
  } catch (error) {
    next(error);
  }
};

locationController.geocoder = async (req, res, next) => {
  const preaddress = req.params.address.trim();
  const address = encodeURIComponent(preaddress);
  const stateMatch = preaddress.match(/\b[A-Z]{2}\b/);
  try {
    if (address.includes(stateMatch)) {
      console.log(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKeyGoogle}`
      );
      const unwrapped = await response.json();
      if (
        unwrapped.status !== 'OK' ||
        !unwrapped.results ||
        unwrapped.results.length === 0
      ) {
        return next(new Error(`Geocoding error: ${unwrapped.status}`));
      }
      const locationData = unwrapped.results.filter(
        (result) => result.geometry
      );
      if (locationData.length === 0) {
        return next(
          new Error('Geocoding error: No valid results with geometry found')
        );
      }

      res.locals.geocode = locationData[0];

      return next();
    } else {
      return next();
    }
  } catch (error) {
    console.error('Geocoder error:', error);
    return next(error);
  }
};
module.exports = locationController;
