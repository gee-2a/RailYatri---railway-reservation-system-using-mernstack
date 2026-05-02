const express = require('express');
const router = express.Router();
const { createTrain, getTrains, updateTrain, deleteTrain, getAnalytics, getTrainBookings, getTrainStatus } = require('../controllers/trainController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/analytics').get(protect, admin, getAnalytics);

router.route('/')
    .get(getTrains)
    .post(protect, admin, createTrain);

router.route('/:id')
    .put(protect, admin, updateTrain)
    .delete(protect, admin, deleteTrain);

router.route('/:id/bookings').get(protect, admin, getTrainBookings);
router.route('/:id/status').get(protect, getTrainStatus);

module.exports = router;

