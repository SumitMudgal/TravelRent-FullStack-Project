// Route for Searching a Place using country or state or location

const express = require("express");

const router = express.Router();

const Listing = require("../models/01_listening");
const wrapAsync = require("../utils/wrapAsync");


// 1] GET  =>  "/search" => Returns the Places that have same location as in the search bar.
router.get("/", wrapAsync(async (req, res) => {
      let { location } = req.query;

      let search_places_list = [];
      
       if (location) {
        // 1. Find by location
        let locationMatches = await Listing.find({
            location: { $regex: location, $options: "i" }
        });

        // 2. Find by country
        let countryMatches = await Listing.find({
            country: { $regex: location, $options: "i" }
        });

        // 3. Merge & remove duplicates
        let seen = new Set();
        search_places_list = [...locationMatches, ...countryMatches].filter(item => {
            if (seen.has(item._id.toString())) {
                return false; // skip duplicate
            }
            seen.add(item._id.toString());
            return true;
        });
    }


      res.render("listings/search_lists.ejs", {location, search_places_list});
}))


// Now export these routes.

module.exports = router;
