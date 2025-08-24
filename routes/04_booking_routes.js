// Routes related to Booking the place

const express = require("express");

const router = express.Router();

const Booking = require("../models/04_booking");

const Listing = require("../models/01_listening");

const User = require("../models/03_user");

const { isLoggedIn } = require("../Authentication_Middleware.js");

const { isLoggedInforBookings } = require("../Authentication_Middleware.js");

//  Import RAZORPAY
const Razorpay = require("razorpay");

// Razorpay Account Details i.e. Api keys and secret
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,       // Your Key ID
    key_secret: process.env.RAZORPAY_SECRET // Your Key Secret
});



// Show Booking Form
router.get("/:placeId/book", isLoggedIn, async (req, res) => {
    const { placeId } = req.params;
    const place = await Listing.findById(placeId);
    res.render("bookings/book_form.ejs", { place });
});


// Create Booking (before payment)
router.post("/:placeId/book", isLoggedIn, async (req, res) => {
    const { placeId } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const place = await Listing.findById(placeId);
    const totalDays = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
       req.flash("error", "Check-out date must be after check-in date");
       return res.redirect("back");
    }

    const totalPrice = totalDays * place.price;

    const newBooking = new Booking({
        user: req.user._id,
        place: placeId,
        checkIn,
        checkOut,
        guests,
        totalPrice
    });

    await newBooking.save();

    // TODO: Redirect to payment gateway
    res.redirect(`/bookings/${newBooking._id}/pay`);
});


// Payment Page (use Razorpay or any gateway)
router.get("/:bookingId/pay", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("place");
    
    // Create Razorpay order
    const options = {
        amount: booking.totalPrice * 100, // Razorpay works in paise
        currency: "INR",
        receipt: `receipt_${bookingId}`,
    };

    const order = await razorpayInstance.orders.create(options);
    
    res.render("bookings/payment.ejs", { booking, key: process.env.RAZORPAY_KEY, orderId: order.id });
});

// Payment Success Redirect (Razorpay calls via GET)
router.get("/:bookingId/pay/success", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Optionally verify payment here before marking success
        await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" });

        req.flash("success", "Payment successful and booking confirmed!");
        res.redirect("/bookings/my-bookings");
    } catch (err) {
        console.error("Payment success handling error:", err);
        req.flash("error", "Something went wrong while confirming payment.");
        res.redirect("/listings");
    }
});

// Payment Success Callback
router.post("/:bookingId/pay/success", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;
    const { razorpay_payment_id } = req.body;  // updated to match Razorpay

    await Booking.findByIdAndUpdate(bookingId, { paymentId: razorpay_payment_id, status: "confirmed" });

    req.flash("success", "Payment successful and booking confirmed!");
    res.redirect("/bookings/my-bookings");
});


// Payment Failure callbak
router.get("/:bookingId/pay/failure", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;

    try{
        await Booking.findByIdAndUpdate(bookingId, {status: "failed"});

        req.flash("error", "Payment failed! Please try again.");
        res.redirect("/listings");
    }
    catch(err) {
        console.log("Payment Failed", err);
        req.flash("error", "Something went wrong while payment.");
        res.redirect("/listings");
    }
}) 


// User Dashboard for Bookings
router.get("/my-bookings", isLoggedInforBookings, async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate("place");
    res.render("bookings/my_bookings.ejs", { bookings });
});


module.exports = router;
