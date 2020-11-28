const {
  fetchFromChicagoBiz,
  fetchFromGoogle,
  fetchFromYelp,
} = require('./apiMethods');

// Business that i'll test on yelp and google
const mcdonalds = {
  name: 'mcdonalds',
  address: '10 E Chicago Ave',
};

// Business that i'll test on Chicago Business
const chicagoSearchField = 'address';
const chicagoSearchValue = '720 S EAST AVE  1';

const printFoundBusinessData = (foundBusinessData) => {
  console.log('CHICAGO BUSINESS DATA', foundBusinessData.chicagoData);
  console.log('GOOGLE DATA', foundBusinessData.googleData);
  console.log('YELP DATA', foundBusinessData.yelpData);
};

// searchField and searchValue are for fetching the business data from the Chicago Business API.
// Examples are address, name, etc
// https://dev.socrata.com/foundry/data.cityofchicago.org/r5kz-chrr
const main = async (searchField, searchValue, businessData) => {
  // Since the chicago business api is a little weird, the main method has an optional parameter
  const chicagoData = await fetchFromChicagoBiz(searchField, searchValue);
  const googleData = await fetchFromGoogle(businessData);
  const yelpData = await fetchFromYelp(businessData);

  const foundBusinessData = { chicagoData, googleData, yelpData };

  // In case we need to print the data
  printFoundBusinessData(foundBusinessData);

  return foundBusinessData;
};

// replace mcdonalds with any other business, mcdonalds is just for testing
main(chicagoSearchField, chicagoSearchValue, mcdonalds);
