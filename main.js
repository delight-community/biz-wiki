const {
  fetchFromChicagoBiz,
  fetchFromGoogle,
  fetchFromYelp,
} = require("./apiMethods");

// Business that i'll test on Chicago Business
const chicagoSearchField = "zip_code";
const chicagoSearchValue = "60606";
const desiredYelpFields = {
  "categories": "",
  "is_claimed": "",
  "cross_streets": "",
  "coordinates": "",
  "photos": "",
  "image_url": "",
  "hours": "",
  "display-phone": "",
  "url": "",
};
const desiredGoogleFields = {
  "address_components": "",
  "business_status": "",
  "permanently_closed": "",
  "formatted_phone_number": "",
  "photos": "",
  "types": "",
  "hours": "",
  "website": "",
};

const desiredChicagoBizFields = {
  business_activity: "",
  location: "",
  latitude: "",
  longitude: "",
  license_description: "",
  ward: "",
  precinct: "",
  ward_precinct: "",
  city: "",
  state: "",
  zip_code: "",
  doing_business_as_name: "",
  legal_name: "",
};


//GOAL
// Input: zip code
// Output: as much info as possible for each business

const delay = t => new Promise(resolve => setTimeout(resolve, t));

const buildCategories = (allProjectedBusinessData) => {
  return allProjectedBusinessData.map(currentData => {
    return {
      "location": {
        cross_streets: currentData?.yelp?.cross_streets,
        coordinates: currentData?.yelp?.coordinates,
        address_components: currentData?.google?.address_components,
        chicago_license_location: currentData?.chicago?.location,
        chicago_license_latitude: currentData?.chicago?.latitude,
        chicago_license_longitude: currentData?.chicago?.longitude,
        ward: currentData?.chicago?.ward,
        precinct: currentData?.chicago?.precinct,
        "ward-precinct": currentData?.chicago?.["ward-precinct"],
        city: currentData?.chicago?.city,
        state: currentData?.chicago?.state,
        zip_code: currentData?.chicago?.zip_code
      },
      "contact": {
        "display-phone": currentData?.yelp?.["display-phone"],
        formatted_phone_number: currentData?.google?.formatted_phone_number,
        website: currentData?.google?.website,

      },
      "details": {
        hours: currentData?.yelp?.hours,
        is_claimed_on_yelp: currentData?.yelp?.is_claimed,
        yelp_hours: currentData?.yelp?.hours,
        yelp_url: currentData?.yelp?.url,
        yelp_tags: currentData?.yelp?.categories,
        business_status: currentData?.google?.business_status,
        permanently_closed: currentData?.google?.permanently_closed,
        google_tags: currentData?.google?.types,
        google_hours: currentData?.google?.hours,
        business_activity: currentData?.chicago?.business_activity,
        license_description: currentData?.chicago?.license_description,
        doing_business_as_name: currentData?.chicago?.doing_business_as_name,
        legal_name: currentData?.chicago?.legal_name
      },
      "photos": {
        image_url: currentData?.yelp?.image_url,
        yelp_photos: currentData?.yelp?.photos,
        google_photos: currentData?.google?.photos

      }
    }
  })
}

// searchField and searchValue are for fetching the business data from the Chicago Business API.
// Examples are address, name, etc
// https://dev.socrata.com/foundry/data.cityofchicago.org/r5kz-chrr
const main = async (searchField, searchValue) => {
  // Since the chicago business api is a little weird, the main method has an optional parameter
  const businessData = await fetchFromChicagoBiz(searchField, searchValue, desiredChicagoBizFields)
    .then((allBizData) => {
      // Change doing_business_as_name to name
      return allBizData.map((singleBizData) => {
        singleBizData = {chicago: singleBizData};
        singleBizData.name = singleBizData.chicago.doing_business_as_name;
        singleBizData.address = singleBizData.chicago.address;
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
              fetchFromGoogle(singleBizData, desiredGoogleFields)
                .then(
                  async (singleBizDataPlusGoogle) =>
                    fetchFromYelp(singleBizDataPlusGoogle, desiredYelpFields).catch((err) =>
                    console.error(`died in yelp: ${err.message}: ${singleBizDataPlusGoogle.chicago.name}`)
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

  
  
  
  const categorizedBusinessData = buildCategories(businessData);

  // console.log(categorizedBusinessData);

  categorizedBusinessData.forEach(x => console.log(JSON.stringify(x, null, 2)));
  console.log("done");

  return categorizedBusinessData
  
  ;
};

// replace mcdonalds with any other business, mcdonalds is just for testing
main(chicagoSearchField, chicagoSearchValue);
