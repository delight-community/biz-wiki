const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

// Replace these with your actual API codes
// I used dotenv to help, so they're set to my .env file
const YELP_API = process.env.YELP_API;
const GOOGLE_API = process.env.GOOGLE_API;

const CHICAGO_BIZ_ENDPOINT =
  'https://data.cityofchicago.org/resource/r5kz-chrr.json';

const YELP_BUSINESS_ENDPOINT =
  'https://api.yelp.com/v3/businesses/matches?city=chicago&state=il&country=US';
const YELP_ID_ENDPOINT = 'https://api.yelp.com/v3/businesses/';

const GOOGLE_PLACES_SEARCH_ENDPOINT =
  'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?&inputtype=textquery';
const GOOGLE_PLACES_DETAILS_ENDOINT =
  'https://maps.googleapis.com/maps/api/place/details/json?&';

// ALL THE BELOW METHODS RETURN THE JSON DATA RECEIVED FROM THE APIs

// Need to add search value and search parameter, as function parameters
// Then write a filter statement based off it
const fetchFromChicagoBiz = async (searchField, searchValue) => {
  console.log('Searching Chicago Business for data....');

  // Right now I'm requiring a searchField and searchValue, but that can change
  if (!searchField || !searchValue) {
    console.error('Missing searchField and/or searchValue');
    return;
  }

  const chicagoDump = await fetch(
    `${CHICAGO_BIZ_ENDPOINT}?${searchField}=${searchValue}`,
    {
      method: 'get',
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  console.log(
    `Found Chicago Business details for ${searchField} : ${searchValue}`
  );
  if (chicagoDump) return chicagoDump;
};

// businessData - Right now the method runs on the assumption that businessData contains a name and an address
const fetchFromYelp = async (businessData) => {
  console.log('Searching Yelp for data ....');
  if (!businessData) {
    console.error('Missing searchField and/or searchValue');
    return;
  }
  // Basically just to grab the business id
  let yelpData = await fetch(
    `${YELP_BUSINESS_ENDPOINT}&name=${businessData.name}&address1=${businessData.address}`,
    {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + YELP_API,
      },
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // Searches by id to get even MORE info
  const businessId = yelpData.businesses[0].id;
  try {
    yelpData = await fetch(`${YELP_ID_ENDPOINT}${businessId}`, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + YELP_API,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

    if (yelpData) {
      console.log(`Found yelp details for ${businessData.name}`);
      return yelpData;
    }
  } catch (err) {
    console.error(
      err,
      `Couldn't find business data for ${yelpResponse.businesses[0].name}`
    );
  }
};

// businessData - Right now the method runs on the assumption that businessData contains a name and an address
const fetchFromGoogle = async (businessData) => {
  console.log('Searching google for place data....');
  let googleData = await fetch(
    `${GOOGLE_PLACES_SEARCH_ENDPOINT}&key=${GOOGLE_API}&input=${businessData.name} ${businessData.address}`,
    {
      method: 'get',
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  try {
    const placeId = googleData.candidates[0].place_id;
    console.log(`Found google place id for ${businessData.name}: ${placeId}`);

    // Searches by id to get even MORE info
    googleData = await fetch(
      `${GOOGLE_PLACES_DETAILS_ENDOINT}&key=${GOOGLE_API}&place_id=${placeId}`,
      { method: 'get' }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));
  } catch (err) {
    console.error(
      err,
      `Could not find google place details for ${businessData.name}`
    );
  }
  console.log(`Found google place details for ${businessData.name}`);

  return googleData;
};

module.exports = {
  fetchFromChicagoBiz,
  fetchFromYelp,
  fetchFromGoogle,
};
