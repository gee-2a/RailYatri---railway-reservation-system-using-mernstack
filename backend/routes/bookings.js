const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getAllBookings, downloadTicketPDF } = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getUserBookings)
    .post(protect, createBooking);

router.route('/all').get(protect, admin, getAllBookings);

router.route('/:id/cancel').put(protect, cancelBooking);

router.route('/:id/pdf').get(protect, downloadTicketPDF);

module.exports = router;
