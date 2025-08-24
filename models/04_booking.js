const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
      type: Number,
      required: true,   // you can make it optional if you want
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    paymentId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Creating Model and collection of Schema i.e. Structure

const Booking = mongoose.model("Booking", bookingSchema);


// Export the Collection i.e. Booking

module.exports = Booking;
