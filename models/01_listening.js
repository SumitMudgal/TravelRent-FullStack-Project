const mongoose = require("mongoose");

const Reviews = require("./02_reviews");  // This line is written in "Project phase-2 part-a"
const User = require("./03_user");

// Creating Listening Schema i.e. Structure

const ListingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,   // Isko String isliye rakha kyuki apan image ka URL pass karne wale hai.

        default: "https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",

        set: (v) => v === "" ? "https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg" : v
    },
    price: Number,
    location: String,
    country: String,

    // ye Review apan Project Phse 2 part a ke baad kar rahe hai.
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reviews"  // Kis collection me se reference lena hai => "Review"
        }
    ],

    // Project Phase 2 Part E "Owner of Listing/Place"
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"  // User Collection Name "User"
    },


    // Project Phase 3 Part B "Maps"
    map_url: String
});


// Mongoose Middleware "post" for deleting "reviews" from Collection "Reviews" after deleting any Listing Place
// This function is writeen in Project Phase-2 Part-a:-

ListingSchema.post("findOneAndDelete", async (place_details) => {
    if(place_details) {
        await Reviews.deleteMany({_id: {$in: place_details.reviews}});  // Uss deleted Place Document ke "reviews" Array me jitne bhi Reviews ke reference Object id hogi, wo sab "Reviews" Collection me se Delete hojayegi.
    }
});


// Create Collection & model with the above defined schema i.e. structure.

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;











