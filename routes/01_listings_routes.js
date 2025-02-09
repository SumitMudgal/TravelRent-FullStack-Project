const express = require("express");

const router = express.Router();   // require Express Router

const path = require("path");
// Project Phase-2 part-b

// Import modules
const Listing = require("../models/01_listening.js");

const Reviews = require("../models/02_reviews.js");

// Import modules
const User = require("../models/03_user");
const passport = require("passport");

// Import wrapAsync
const wrapAsync = require("../utils/wrapAsync.js");

// Import ExpressError file
const ExpressError = require("../utils/ExpressError.js");


// Project Phase-2 Part-e
// Authentication Middleware
const  { isLoggedIn, is_Owner }  = require("../Authentication_Middleware.js");

// Project Phase 3 Part A "Import Cloud Folder"
const { storage } = require("../Cloud_Config.js");

// Project Phase 3 Part A "Multer" for"Image i.e. file Upload
const multer = require("multer");
//const upload = multer( {dest: path.join(__dirname, "../uploads")} );    // Agar "uploads" naam ka folder exists nahi karta hoga to ye command Automatically pehle uss naam ka folder create bhi kar degi.

const upload = multer( { storage } ); //  Multer hamari Images ko Cloudinary ke Folder me Upload karega.


// Now Cut and Paste here all the "/listings" related routes from "index.js" file.

// Home page    "/"  check if or not

router.get("/check", (req,res) => {
    res.send("Website is Working");
})

// test Listing
router.get("/testlisting", wrapAsync(async (req,res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach!",
        price: 1200,
        location: "Goa",
        country: "India"
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
}))


// Routes

// Index Route

// 1] GET       "/listings"       => Print or return all the hotels/villas/etc... list.

router.get("/", wrapAsync(async (req,res) => {   // earlier address "/listings"
    let all_list = await Listing.find({});
    res.render("listings/all_lists.ejs", { all_list });
}));

//--------------------x-----------------------


//*Route 2:  (Show Route)
/*
=> GET      "/listings/:id"     => To show some specific place with all its information.

*/

router.get("/:id/find", wrapAsync(async (req, res) => {      // earlier address "/listings/:id/find"
    let { id } = req.params;
    let place_details = await Listing.findById(id).populate({path: "reviews" , populate: {path: "author"}}).populate("owner");        // Updating with ".populate(owner)" in Project Phase 2 Part E "Listing Owner".
    console.log(place_details);

    //--------------- Project Phase 2 Part E "Edit and Delete Owner Authorization"
    let Current_User = req.user;
    //----------------------------------------------------------------

    
    res.render("listings/place_details.ejs", { place_details, Current_User });     // NOTE: "Current_User" Project Phase 2 Part E me send kiya.
}));

//-----------------------x-----------------


/*
*Route 3: CREATE  (New & Create Route)

=> GET       "/listings/new"     => get a form for entering the details of new place in listings.

> POST       "/listings"         => After submiting that GET form, new place will be added in the listings collection in the database. And redirect to "/listings".

*/


router.get("/new", isLoggedIn ,((req, res) => {     // earlier address "/listings/new"
   
    // Project Phase-2 Part-e me iss Route ko edit kar rahe hai, for "Authentication" before Rendering the Form
    
     // else, just render the Form
    res.render("listings/new_place.ejs");
}));

// Commenting this for "Project Phase 3 Part A" => "Image Upload" => "Multer"

router.post("/", isLoggedIn, upload.single("place_image"), wrapAsync(async (req, res) => {      // earlier address "/listings"
    
    // Project Phase 3 Part A "Image Url from Cloudinar"-------------------
    let image = req.file.path;
    //-------------------------------------------------------------------
    
    let { title, description, price, location, country } = req.body;

    let owner = req.user;

    await Listing.insertMany([{title: title, description: description, image: image, price: price, location: location, country: country, owner: owner._id}]);  // NOTE: "owner" ko baadme add kiya hai "Project Phase 2 Part E" me.
    
    let new_place = {title: title, description: description, image: image, price: price, location: location, country: country, owner: owner.username}; // sirf console karne ke liye likha hai, jaroorat nahi hai.
    
    console.log(new_place);
     
    // Project Phase-2 Part-c
    req.flash("success", "New Listing Created!");  // Iska matlab jaise hi Koi new Listing Create hogi waise hi "New Listing Created" message print hojayega.

    res.redirect("/listings");
}));


/*
router.post("/", upload.single("place_image"), wrapAsync (async (req, res) => {    // NOTE: idhar upload single me "place_image" isliye likha kyuki wohi NAME hai hamare "new_place.ejs" me "Image Upload wale Input" ka. 
     res.send(req.file);
}) )
*/

//Note: Idhar "upload.single("place_image")" hamari inpu Image ko ab Cloudinary ke Folder storage me Store karega kyuki apan ne upar "upload" ki defination me "multer" ko call karke usme Cloudinary ka "Storage" folder likha hai. 

//-----------------x------------------


/*
*Route 4: UPDATE  (Edit & Updte Route)

=> GET        "/listings/:id/edit"   =>  Get a form which can edit the values of a place.

=> PATCH       "/listings/:id"    => After submitting the form, update the place information in the database, and redirect to "/listings".
*/


router.get("/:id/edit", isLoggedIn, is_Owner ,wrapAsync(async (req, res) => {      // earlier address "/listings/:id/edit"
    let { id } = req.params;
    let place_info = await Listing.findById(id);
    console.log(place_info);

    //----------- Project Phase 2 Part E " Edit nd Delete Authorization" -------------------------------------
    
     // We have created the Middleware for this, in file "Authentication_Middleware.js" with name "is_Owner". And passed it in this Route As a Parameter.
    //-----------------------------------------------------------------------------

    res.render("listings/edit_place.ejs", { place_info });
}))

router.patch("/:id", isLoggedIn, upload.single("place_image") ,wrapAsync(async (req, res) => {     // earlier address "/listings/:id"
    
    // Project Phase 3 Part B "Edit Upload Image"--------------------------------------
    
    // Pehle Check karege kya Edit form me New Image Upload ki hai User ne. Agar Ki hai tobhi Image Upload karege, warna Empty File thodi na upload kar sakte hai, error aajayega fir to.
    let place_image;

    if(req.file) {
        place_image = req.file.path;  // Means Agar Koi File Form se AAyi hai Backend me, to hi Image Upload karege, warna nahi.
    }

    //------------------------------------------------------------------
    
    let { id } = req.params;
    let { title, description, price, location, country } = req.body;
    
    if(req.file) {    // If Image is NEw Image is Uploaded, then we update Image
        await Listing.findByIdAndUpdate(id, {title: title, description: description, image: place_image, price: price, location: location, country: country});
    }
    else {          // If New Image is Not Uploded in form, then we will Not Update image, and update the remaining details.
        await Listing.findByIdAndUpdate(id, {title: title, description: description, price: price, location: location, country: country});
    }

    // print updated place info
    let place_info = await Listing.findById(id);
    console.log(place_info);
    res.redirect("/listings");
}))

//-----------------x------------------------


/*
*Route 5: DELETE (Delete Route)

=> DELETE       "/listings/:id/delete"       => Delete thw place from the database, After deleting the selected Place from the database , redirect to "/listings" .
*/

router.delete("/:id/delete", isLoggedIn, wrapAsync(async (req, res, next) => {     // earlier address "/listings/:id/delete"
    let { id } = req.params;

    console.log("The following place is deleted: ",await Listing.findById(id));
    
    await Listing.findByIdAndDelete(id);
    
    res.redirect("/listings");
}))

//-----------------------------------x----------------------------


// Now export these routes.

module.exports = router;














