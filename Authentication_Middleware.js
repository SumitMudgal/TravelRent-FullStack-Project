const Listing = require("./models/01_listening");


// Project- phase- Part e

let isLoggedIn = (req, res, next) => {
    if(! req.isAuthenticated()) // i.e. NOT Authenticated
    {
       //----------- Project Phase 2 Part e "Post-login" ----------------------
         
       req.session.url_user_trying_to_access = req.originalUrl;   // Creating a New Variable "url_user_trying_to_access"  in request Session. Jisme req ki originalUrl i.e. jiss url pe user jaana chahata tha login ke pehle, usko store kardiya.
       //------------------------------------------------
       req.flash("error", "You must be logged in to create or edit new Listings.")
       return res.redirect("/login");
    }
     // else
    next();
}  

//   (Continue) =>  Project Phase 2 Part e "Post-login" ----------------------


let save_User_Url_to_Access = (req, res, next) => {
    if(req.session.url_user_trying_to_access) {
        res.locals.url_user_trying_to_access = req.session.url_user_trying_to_access;  // Creating a New Variable "url_user_trying_to_access"  in response "locals". Jisme req ki originalUrl i.e. jiss url pe user jaana chahata tha login ke pehle, usko store kardiya.
    }
    next();
};


// Project Phase 2 Part E "User Owner Authorization" Middleware:-
is_Owner = async (req, res, next) => {
    let { id } = req.params;
    let place_info = await Listing.findById(id);

    let Current_User = req.user;

    if(Current_User && Current_User._id.toString() != place_info.owner.toString()) {
        req.flash("error", "Only the Owner of Place can Edit the Place Details.");
        return res.redirect(`/listings/${id}/find`);
    }
    next();
};





module.exports = {
    isLoggedIn,
    save_User_Url_to_Access,
    is_Owner,
};





