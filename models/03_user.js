const mongoose = require("mongoose");

// We are using "passport-local" login / singnin method of Passport.

const passport_Local_Mongoose = require("passport-local-mongoose");


// Define Schema i.e. Structure of "User"

const user_Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});         // username and password "passport-local" khud hi define karta hai, to wo likhne ki jaroorat nahi.

// Plugin that "Passport-Method-Mongoose" in this schema

user_Schema.plugin(passport_Local_Mongoose);    // This will perform all the passowrd hasing & Salting. It will also Include "username" and "password" keys in the Schema.


// Creating Model and collection of Schema i.e. Structure

const User = mongoose.model("User", user_Schema);


// Export the Collection i.e. Model

module.exports = User;






