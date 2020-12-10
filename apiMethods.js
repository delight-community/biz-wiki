const fetch = require("node-fetch");
const dotenv = require("dotenv");
const { project } = require("./helpers");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
dotenv.config();

// Replace these with your actual API codes
// I used dotenv to help, so they're set to my .env file
const YELP_API = process.env.YELP_API;
const GOOGLE_API = process.env.GOOGLE_API;
const GOOGLE_SEARCH_API = process.env.GOOGLE_SEARCH_API;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

const CHICAGO_BIZ_ENDPOINT =
  "https://data.cityofchicago.org/resource/r5kz-chrr.json";

const YELP_BUSINESS_ENDPOINT =
  "https://api.yelp.com/v3/businesses/matches?city=chicago&state=il&country=US";
const YELP_ID_ENDPOINT = "https://api.yelp.com/v3/businesses/";

const GOOGLE_PLACES_SEARCH_ENDPOINT =
  "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?&inputtype=textquery";
const GOOGLE_PLACES_DETAILS_ENDOINT =
  "https://maps.googleapis.com/maps/api/place/details/json?&";

// ALL THE BELOW METHODS RETURN THE JSON DATA RECEIVED FROM THE APIs

// Need to add search value and search parameter, as function parameters
// Then write a filter statement based off it
const fetchFromChicagoBiz = async (
  searchField,
  searchValue,
  desiredFields = undefined
) => {
  console.log("Searching Chicago Business for data....");

  // Right now I'm requiring a searchField and searchValue, but that can change
  if (!searchField || !searchValue) {
    console.error("Missing searchField and/or searchValue");
    return;
  }

  let chicagoDump = await fetch(
    `${CHICAGO_BIZ_ENDPOINT}?${searchField}=${searchValue}`,
    {
      method: "get",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  console.log(
    `Found Chicago Business details for ${searchField} : ${searchValue}`
  );

  if (desiredFields) {
    chicagoDump = chicagoDump.map((singleBiz) =>
      project(singleBiz, desiredFields)
    );
  }
  if (chicagoDump) return chicagoDump;
};

// businessData - Right now the method runs on the assumption that businessData contains a name and an address
const fetchFromYelp = async (businessData, desiredFields = undefined) => {
  console.log("Searching Yelp for data ....");
  if (!businessData) {
    console.error("Missing searchField and/or searchValue");
    return;
  }
  // Basically just to grab the business id
  let yelpData = await fetch(
    `${YELP_BUSINESS_ENDPOINT}&name=${businessData.name}&address1=${businessData.address}`,
    {
      method: "get",
      headers: {
        Authorization: "Bearer " + YELP_API,
      },
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // Searches by id to get even MORE info
  const businessId = yelpData?.businesses?.[0]?.id;
  if(yelpData?.businesses?.length == 0) {
    return businessData;
  }
  try {
    yelpData = await fetch(`${YELP_ID_ENDPOINT}${businessId}`, {
      method: "get",
      headers: {
        Authorization: "Bearer " + YELP_API,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

    if (yelpData && !yelpData.error) {
      console.log(`Found yelp details for ${businessData.name}`);
      if (desiredFields) {
        yelpData = project(yelpData, desiredFields);
      }
      return {
        yelp: yelpData,
        ...businessData,
      };
    }

    console.log(
      `Failed to find yelp details for ${businessData.name}: ${yelpData?.error?.description} (${yelpData?.error?.code})`
    );
    return businessData;
  } catch (err) {
    console.error(
      err,
      `Couldn't find business data for ${yelpResponse.businesses[0].name}`
    );
  }
};

// businessData - Right now the method runs on the assumption that businessData contains a name and an address
const fetchFromGoogle = async (businessData, desiredFields = undefined) => {
  console.log("Searching google for place data....");
  let googleData = await fetch(
    `${GOOGLE_PLACES_SEARCH_ENDPOINT}&key=${GOOGLE_API}&input=${businessData.name} ${businessData.address}`,
    {
      method: "get",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  try {
    const placeId = googleData?.candidates?.[0]?.place_id;
    console.log(`Found google place id for ${businessData.name}: ${placeId}`);

    // Searches by id to get even MORE info
    if (placeId) {
      googleData = await fetch(
        `${GOOGLE_PLACES_DETAILS_ENDOINT}&key=${GOOGLE_API}&place_id=${placeId}`,
        { method: "get" }
      )
        .then((res) => res.json())
        .catch((err) => console.error(err));
    }
  } catch (err) {
    console.error(
      err,
      `Could not find google place details for ${businessData.name}`
    );
    return businessData;
  }
  console.log(`Found google place details for ${businessData.name}`);
  if (googleData?.result && desiredFields) {
    googleData.result = project(googleData.result, desiredFields);
  }
  return {
    google: googleData.result,
    ...businessData,
  };
};

// const fetchDescriptionFromGoogleSearch = async (bizData) => {

//   const exampleData = '"606 salon chicago"'
//   const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(GOOGLE_SEARCH_API)}&cx=${encodeURIComponent(GOOGLE_SEARCH_CX)}&q=${encodeURIComponent(exampleData)}`;

//   const searchData = await fetch(
//     url,
//     { method: 'get' }
//   )
//     .then((res) => res.json())
//     .catch((err) => console.error(err));

//     const tempProjectedFields = {
//       "pagemap": ""
//     };

//   return searchData.items.map(x => x.pagemap.metatags[0]["og:description"]);
//   return searchData;
// }

const fetchDescriptionFromYelpPage = async (bizData) => {
  const url = bizData?.details?.yelp_url;
  //console.log(url);
  if (url != undefined) {
    return fetch(url, { method: "get" })
      .then((res) => res.text())
      .then((html) => {
        const dom = new JSDOM(html);
        //console.log(dom.window.document.querySelector('meta[property="og:description"]').content); // "Hello world"
  
        return dom.window.document.querySelector('meta[property="og:description"]').content;
      })
      .catch((err) => console.error(err));
      
  }
  else {
    console.log("no description found for: " + bizData.name);
    return "no-description";
  }
};

module.exports = {
  fetchFromChicagoBiz,
  fetchFromYelp,
  fetchFromGoogle,
  fetchDescriptionFromYelpPage,
};
