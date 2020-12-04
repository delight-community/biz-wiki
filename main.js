const {
  fetchFromChicagoBiz,
  fetchFromGoogle,
  fetchFromYelp,
} = require("./apiMethods");

// Business that i'll test on Chicago Business
const chicagoSearchField = "zip_code";
const chicagoSearchValue = "60606";

//GOAL
// Input: zip code
// Output: as much info as possible for each business

const delay = t => new Promise(resolve => setTimeout(resolve, t));

// searchField and searchValue are for fetching the business data from the Chicago Business API.
// Examples are address, name, etc
// https://dev.socrata.com/foundry/data.cityofchicago.org/r5kz-chrr
const main = async (searchField, searchValue) => {
  // Since the chicago business api is a little weird, the main method has an optional parameter
  const businessData = await fetchFromChicagoBiz(searchField, searchValue)
    .then((allBizData) => {
      // Change doing_business_as_name to name
      return allBizData.map((singleBizData) => {
        singleBizData.name = singleBizData.doing_business_as_name;
        return singleBizData;
      });
    })
    .then((allBizData) =>
      // call yelp and google for all of the zip code outputs
      Promise.all(
        // Temporary slice for testing (do not )
        allBizData.slice(0, 10).map(async (singleBizData, index) => {
          console.log(`Calling: ${singleBizData.name}`);

          return delay(3000 * (index + 1)).then(() => 
              fetchFromGoogle(singleBizData)
                .then(
                  async (singleBizDataPlusGoogle) =>
                    fetchFromYelp(singleBizDataPlusGoogle).catch((err) =>
                    console.error(`died in yelp: ${err.message}: ${singleBizDataPlusGoogle.name}`)
                  )
                )
                .catch((err) =>
                  console.error(`died in google: ${err.message}: ${singleBizData}`)
                )
          );
        })
      )
    )
    .catch((err) =>
      console.error(`died in outer level / chicago biz level: ${err.message}`)
    );

  // const foundBusinessData = { chicagoData, googleData, yelpData };

  // // In case we need to print the data
  // printFoundBusinessData(foundBusinessData);

  console.log(businessData);
  console.log("done");

  return businessData;
};

// replace mcdonalds with any other business, mcdonalds is just for testing
main(chicagoSearchField, chicagoSearchValue);
