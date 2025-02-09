// Cloud Service ".env" require     => "Project Phase 3 Part A"
if(process.env.NODE_ENV != "production")
{
    require("dotenv").config();
}

// console.log(process.env);

// Import modules
const Listing = require("./models/01_listening.js");

const Reviews = require("./models/02_reviews.js");

// Import wrapAsync
const wrapAsync = require("D:/Apna College Delta part 2/Delta Batch Part2/03_Major_project/utils/wrapAsync.js");

// Import ExpressError file
const ExpressError = require("D:/Apna College Delta part 2/Delta Batch Part2/03_Major_project/utils/ExpressError.js");

// Express
const express = require("express");
const app = express();

// Project Phase 3 Part A "Upload Image"
//------------------------------------------------------------------------


//-------------------------------------------------------------------------------------

// Ejs
const path = require('path');
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));

// EJS-MATE
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

// middleware for parsing req.bodyand other i/p data
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")))  // This line is to use CSS files in public folder.

// Mongoose
const mongoose = require("mongoose");

main().then(() => {
    console.log("connection succesful");
}).catch(err => console.log(err));

async function main() {
   // await mongoose.connect("mongodb://127.0.0.1:27017/Travelrent");

   // Project Deployment "Project Phase 3 Part D"
   await mongoose.connect(process.env.ATLASDB_URL);
}

// Method-Override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));

// Import "/listings" Routes  "Project Phase-2 Part-b"
const listing = require("./routes/01_listings_routes.js");

// Import "/listings/:id/reviews" Routes  "Project Phase-2 Part-b"
const review = require("./routes/02_reviews_routes.js");

// Import "/signup" Routes   "Project Phase-2 part-d"
const user = require("./routes/03_user_routes.js");

// Express Session                             
const session = require("express-session");      // Project Phase-2 Part-c

// Project Deployment:- Project Phase 3 Part D-------------------------------
const MongoStore = require("connect-mongo");
//------------------------------------------------------------------------


// Connect-Flash
const flash = require("connect-flash");

// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/03_user.js");


// Project Phase 3 Part D "Connect-Mongo Session" --------------------------

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,  // Database Url jahape User ka Session Data Store Hoga.
    crypto: {
        secret: process.env.SECRET  // Changed String For Deploying
    },
    
    touchAfter: 24 * 60 * 60   // 24 Hours tak User Data Store karega 
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

//---------------------------------------------------------------------

const session_Options = {
    store,  // After Connect-Mongo "store" written 
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 ,  // Yaane aaj ke current time ke 7 Din baad i.e. "7 Din jisme 24 hours hai jisme 60 minutes hai jisme 60 seconds hai, jisme 1000 miliseconds hai."
                                                       // Aisa pooraa multiplication isliye likha kyuki "expires" me time value "miliseconds" me chahiye.
        maxAge: 7 * 24 * 60 * 60 * 1000  ,// Same as expires, but after present time
        
        httpOnly: true
      }
};



app.use(session(session_Options));

app.use(flash());
// Flash Middleware create
// app.use((req, res, next) => {

//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");

//     next();
// })

    
//---------------------------------------------------------------------------------------------

// Passport (Project Phase-2 Part-d)

app.use(passport.initialize());  // Jab bhi koi request aaye tab ek baar "Passport" ko initialize karega.

app.use(passport.session());    // "passport.session()" ko hum isliye use karte hai, taki jab koi already logined user website ke diffrent different pages pe jaaye different brwoser tabs me, tab usko baar baar login na karna pade. Ek baar login kiya to poore session me Website ke har Pages new tabs me wohi user login rehna chahiye.

passport.use(new LocalStrategy( User.authenticate()));   // jab bhi koi new User aayega Website pe, to Passport usko "Authenticate" karega i.e. "Login/Singup" by using Collection "User" in Database of MongoDb.

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// Note: "Serialization" ka matlab jab bhi koi User Login karta hai Website pe, to uski saari ki saari information uss Session ke andar serialize i.e. "Store/Scan" hojayegi, jisse use baar baar login nahi karna padega.

// Note: "Deserialization" ka matlab jab bhi koi User SignOut karta hai website se, aur apan uska Data/Information "Unstore" karna chahate hai Session se, tab "Deserialize" method use karte hai.

app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.current_User = req.user;
    console.log(req.user);
    
    next();
})

// Route for Creating a Demo Fake User on website and database

app.get("/demouser", async (req, res) => {
   
    let fakeUser = new User({       // Creating any Fake User data
        username: "Shahrukh Khan",
        email: "Shahrukh@gmail.com"
        // password apan alag se dege.
    });

    let register_fake_user = await User.register(fakeUser, "Shahrukh123");     // "Collection_name.register(data, password)" i.e. "register(data_Object, password)" is pre-defined Passport Method, jo user ko Database me insert karega, aur sath me "password" me hasing and Salting bhi kar dega.

    res.send(register_fake_user);
})


// * SingUp User Routes:-   Inn Routes ko apan folder "routes" ke andar create karege in file "03_user_routes.js" .

app.use("/", user);    // "user" variable contains (require"03_user_routes.js")
//------------------------------------------------------------------------------------

let port = 8080;

app.listen(port, () => {
     console.log(`Listening to port ${port}`);
})


// // Home page    "/"  check if or not

// app.get("/", (req,res) => {
//     res.send("Website is Working");
// })

// // test Listing
// app.get("/testlisting", wrapAsync(async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach!",
//         price: 1200,
//         location: "Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// }))


// // Routes

app.use("/listings", listing);   // After commenting here all Routes code and Coping them to "01_listings_routes.js" file. "Project Phase-2 Part-b"

// // Index Route

// // 1] GET       "/listings"       => Print or return all the hotels/villas/etc... list.

// app.get("/listings", wrapAsync(async (req,res) => {
//     let all_list = await Listing.find({});
//     res.render("listings/all_lists.ejs", { all_list });
// }));

// //--------------------x-----------------------


// //*Route 2:  (Show Route)
// /*
// => GET      "/listings/:id"     => To show some specific place with all its information.

// */

// app.get("/listings/:id/find", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let place_details = await Listing.findById(id).populate("reviews");
//     console.log(place_details);
//     res.render("listings/place_details.ejs", { place_details });
// }));

// //-----------------------x-----------------


// /*
// *Route 3: CREATE  (New & Create Route)

// => GET       "/listings/new"     => get a form for entering the details of new place in listings.

// > POST       "/listings"         => After submiting that GET form, new place will be added in the listings collection in the database. And redirect to "/listings".

// */


// app.get("/listings/new", wrapAsync((req, res) => {
//     res.render("listings/new_place.ejs");
// }));

// app.post("/listings", wrapAsync(async (req, res) => {
//     let { title, description, image, price, location, country } = req.body;

//     await Listing.insertMany([{title: title, description: description, image: image, price: price, location: location, country: country}]);
    
//     let new_place = {title: title, description: description, image: image, price: price, location: location, country: country}; // sirf console karne ke liye likha hai, jaroorat nahi hai.
    
//     console.log(new_place);

//     res.redirect("/listings");
// }));

// //-----------------x------------------


// /*
// *Route 4: UPDATE  (Edit & Updte Route)

// => GET        "/listings/:id/edit"   =>  Get a form which can edit the values of a place.

// => PATCH       "/listings/:id"    => After submitting the form, update the place information in the database, and redirect to "/listings".
// */


// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let place_info = await Listing.findById(id);
//     console.log(place_info);
//     res.render("listings/edit_place.ejs", { place_info });
// }))

// app.patch("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let { title, description, image, price, location, country } = req.body;

//     await Listing.findByIdAndUpdate(id, {title: title, description: description, image: image, price: price, location: location, country: country});
//     // print updated place info
//     let place_info = await Listing.findById(id);
//     console.log(place_info);
//     res.redirect("/listings");
// }))

// //-----------------x------------------------


// /*
// *Route 5: DELETE (Delete Route)

// => DELETE       "/listings/:id/delete"       => Delete thw place from the database, After deleting the selected Place from the database , redirect to "/listings" .
// */

// app.delete("/listings/:id/delete", wrapAsync(async (req, res) => {
//     let { id } = req.params;
    
//     console.log("The following place is deleted: ",await Listing.findById(id));
    
//     await Listing.findByIdAndDelete(id);
    
//     res.redirect("/listings");
// }))

// commentinh this above "/listings" routes code after copying them to "rotes" folder file "01_listings_routes.js". Project-Phase-2 Part-b

//------------------------x------------------

// // Project Phase 2 part a

app.use("/listings/:id/reviews", review);    // After commenting here all Routes code and Coping them to "02_reviews_routes.js" file. "Project Phase-2 Part-b"

// Commenting the below Reviews Code Routes after copying them to "02_reviews_routes.js" , Project Phase-2 part-3

// // Reviews Route

// // POST         "/listings/:id/reviews"      => To add a Review in Database collection "Reviews" and also for the particular Place document "review" key.

// app.post("/listings/:id/reviews", async (req, res) => {
//     let { id } = req.params;
//     let { ratings , comment} = req.body;

//     let new_review = await Reviews.create({ratings: ratings, comment: comment});  // This will create the new document with given information.
    
//     await new_review.save();
//     console.log(new_review);

//     let add_Place_review = await Listing.findById(id); // find that place by id

//     add_Place_review.reviews.push(new_review._id); // Ussparticular Place ke "reviews" me bhi wo review ka reference dedege.

//     await add_Place_review.save();

//     console.log("review added Successfull");
//     console.log(id);

//    // res.send("New Reviews saved");
//    res.redirect(`/listings/${id}/find`);
// });

// //----------------------------------------------------

// // DELETE Reviews Route         "/listings/:id/reviews/:review_id"     => To delete the Review from "Review" database collection, and also delete its reference from the Place i.e. "Listing" collection.

// app.delete("/listings/:id/reviews/:review_id", async (req, res) => {
//     let { id , review_id} = req.params;
    
//     let review = await Reviews.findByIdAndDelete(review_id);  // review ko Collection "Reviews" me se Delete karege.

//     await Listing.findByIdAndUpdate(id, {$pull: {reviews: review_id}});   // Listing Collection me Uss particular Place ke "reviews" array me se uss Review ka Reference Object id Delete kar dege.

//     console.log(review);

//     res.redirect(`/listings/${id}/find`);
// })

//------------------------------------------x-------------------------------------



// * error Route i.e. If No i/p Route matches from the above declared Routes, then it will catched by this "* Route i.e. All route", and we will give error using ExpressError.

app.get("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
});



// WrapAsync and Only print Error Code and Message Middleware using ExpressError File we created in "utils" folder.

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).send(message);
})


