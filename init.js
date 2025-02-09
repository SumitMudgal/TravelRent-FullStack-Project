// Initialize the data in the database to perform operations:-

const mongoose = require("mongoose");
const data = require("./data");
const Listing = require("./models/01_listening");

main().
then(() => console.log("connected to DB"))
.catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Travelrent");
};

// Insert the data in the database Travelrent in collection Listing.

let insertFunc = async () => {
    await Listing.deleteMany({}); // Pehle apan ne jo test karte wakt data dala tha uski jaroorat nahi, delete kar dete hai.
    
    await Listing.insertMany(data);
    console.log("Data inserted successfully.");
};

insertFunc();









