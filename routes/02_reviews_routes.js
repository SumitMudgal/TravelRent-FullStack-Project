const express = require("express");

const router = express.Router({mergeParams: true});   // require Express Router. "mergeParams: true" likha kyuki apane request me ":id" params ki value aane wali hai, aur uski apan ko jaroorat hai.

// Project Phase-2 part-b

// Import modules
const Listing = require("../models/01_listening.js");

const Reviews = require("../models/02_reviews.js");

// Project Phase 2 part E "Reviews Authorization"
const Users = require("../models/03_user.js");

const { isLoggedIn } = require("../Authentication_Middleware.js");


const passport = require("passport");
// Now Cut and Paste here all the "/listings/:id/reviews" related routes from "index.js" file.

// Reviews Route

// POST         "/listings/:id/reviews"      => To add a Review in Database collection "Reviews" and also for the particular Place document "review" key.

router.post("/", async (req, res) => {   // earlier address "/listings/:id/reviews"
    let { id } = req.params;
    let { ratings , comment} = req.body;
    
    let Current_User = req.user;
    console.log(Current_User , "Current User");

    let new_review = await Reviews.create({ratings: ratings, comment: comment, author: Current_User._id});  // This will create the new document with given information.

    await new_review.save();
    console.log(new_review);
    
    let add_Place_review = await Listing.findById(id); // find that place by id

    add_Place_review.reviews.push(new_review._id); // Uss particular Place ke "reviews" me bhi wo review ka reference dedege.

    await add_Place_review.save();

    console.log("review added Successfull");
    console.log(id);

   // res.send("New Reviews saved");
   res.redirect(`/listings/${id}/find`);
});

//----------------------------------------------------

// DELETE Reviews Route         "/listings/:id/reviews/:review_id"     => To delete the Review from "Review" database collection, and also delete its reference from the Place i.e. "Listing" collection.

router.delete("/:review_id", async (req, res) => {     // earlier address "/listings/:id/reviews/:review_id"
    let { id , review_id} = req.params;

    let delete_review = await Reviews.findByIdAndDelete(review_id);  // review ko Collection "Reviews" me se Delete karege.

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: review_id}});   // Listing Collection me Uss particular Place ke "reviews" array me se uss Review ka Reference Object id Delete kar dege.

    console.log(delete_review);

    res.redirect(`/listings/${id}/find`);
})


module.exports = router;














