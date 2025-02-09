const mongoose = require("mongoose")

// Creating "Reviews" Schema i.e. Structure

const reviewSchema = new mongoose.Schema({
    ratings: {
        type: Number,
        min: 1,
        max:5
    },
    
    comment: String,

    created_At: {
        type: Date,
        default: Date.now()
    },

    // Project Phase 2 Part E "Review Authorization"
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"     // Reference from Collection "User".
    }
});

module.exports = mongoose.model("Reviews", reviewSchema);






