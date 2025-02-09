// Project Phase-2 Part-d

const express = require("express");

const router = express.Router({mergeParams: true});   // require Express Router. "mergeParams: true" likha kyuki apane request me ":id" params ki value aane wali hai, aur uski apan ko jaroorat hai.

// Import modules
const User = require("../models/03_user");
const passport = require("passport");

// Project Phase 2 Part e
// Authentication Import
const { isLoggedIn, save_User_Url_to_Access } = require("../Authentication_Middleware");


// Route "SignUp":-

// GET     "/signup"     => To Create a New User in Database.

router.get("/signup", (req, res) => {
    res.render("../views/listings/signup.ejs");
})


// POST     "/signup"    => To save the User in Database

router.post("/signup", async (req, res, next) => {
    
    try {
        let { username, email, password } = req.body;

      // Create new User
       let new_user = new User({
        username: username,
        email: email,
        // password ko baadme dege.
      });

      let Save_new_user = await User.register(new_user, password);

      console.log(Save_new_user);
      
      //----------Project Phase 2 part e  " Login after SignUp"-------------------
      req.login(Save_new_user, (err) => {
         
         if(err) {
            return next(err);
         }

         req.flash("success", "Welcome to TravelRent!");

         res.redirect("/listings");
      });
      //----------------------------------------------------------------------------------
    }
    catch (err) {
        req.flash("error","Username or E-mail Already Exists");
        
        res.redirect("/signup")
    }    // NOTE: Try Catch isliye kiya kyuki agar kisika Username already exists karta hoga database me , to "Passport" error dega aur Server STOP hojayega. Server Stop na ho isliye TRY and CATCH Use kiya.
});

//-----------------------------------------------------------------------


// LOGIN User Routes

// GET            "/login"      => To Render a Form to get User;s details and password.

router.get("/login", (req, res) => {
    res.render("../views/listings/login.ejs");
})

// POST      "/login"     => To get the data from the Form and then check if the user Exists in the database and if the password is correct.

router.post("/login", save_User_Url_to_Access, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }) ,async (req, res) => {   // Note 1st argument "local" isliya liya kyuki apni "Passport" method ka Naam "Passport-local" hai.
    
    // Check if the username exists in the Database Collection Users and if the password is correct.
    // Middleware "passport.authenticate()" in the callback function parameter.

     req.flash("success", "Welcome back to TravelRent!");
     
     let redirect_Url = res.locals.url_user_trying_to_access || "/listings";
     //res.redirect(res.locals.url_user_trying_to_access);
     res.redirect(redirect_Url);
})

//-------------------------------------------------------------------------------------

// Project Phase 2 Part e

// Logout Route

// GET           "/logout"           => To Delete the User's Session

router.get("/logout", isLoggedIn ,(req, res) => {

    // Passport logout method
    req.logout((err) => {
        if(err) {
          return  next(err);
        }

        //else
        req.flash("success", "You are Logged Out.");
        res.redirect("/listings");
    })
})



module.exports = router;











