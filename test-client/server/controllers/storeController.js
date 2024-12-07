const storeController = {};
const apiKeyYelp =
  'Itd9XQumgemqBvyoBlyIq8RRtQ6j4ovinypaMnsRucBPGDhwddIC7QP9ZWpFBETWIqajaD5k1JeJ_IBaRzkGDHYq9ACjxozVJCpBK7L-4e-cVYMfWocrrZypOtX1ZnYx';

const apiKeyGoogle = 'AIzaSyDqeU8auILfzdgZG9khry9Gka8K-5pmM2Y';
const options = {
  headers: {
    method: 'GET',
    accept: 'application/json',
    Authorization: `Bearer ${apiKeyYelp}`,
  },
};
storeController.getStores = async (req, res, next) => {
  try {
    const search = req.params.search;
    const radius = req.params.radius;
    let limit = 10;
    if (radius > 5) {
      limit = radius * 2;
    }

    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${search}%radius=${
        radius * 1609.34
      }&term=black%20owned&sort_by=distance&limit=${limit}`,
      options
    );

    res.locals.stores = await response.json();
    return next();
  } catch (error) {
    console.log('please input a valid location');
    next(error);
  }
};

module.exports = storeController;
