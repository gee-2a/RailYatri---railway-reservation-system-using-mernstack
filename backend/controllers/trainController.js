const Train = require('../models/Train');
const Booking = require('../models/Booking');
const railwayApiService = require('../utils/railwayApiService');

exports.getAnalytics = async (req, res) => {
    try {
        const totalRevenueResult = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueResult.length ? totalRevenueResult[0].total : 0;

        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

        res.json({ 
            totalRevenue, 
            totalBookings,
            confirmedBookings,
            cancelledBookings
        });
    } catch (error) {
        console.error('getAnalytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createTrain = async (req, res) => {
    try {
        const train = await Train.create({ ...req.body, availableSeats: req.body.totalSeats });
        res.status(201).json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrains = async (req, res) => {
    try {
        const { source, destination, date } = req.query;

        // 1. Attempt Live API Fetch
        const liveTrains = await railwayApiService.searchLiveTrains(source, destination, date);
        if (liveTrains && liveTrains.length > 0) {
            // Upsert live trains into MongoDB to enable fake booking and track booked seats
            const savedTrains = await Promise.all(liveTrains.map(async (t) => {
                return await Train.findOneAndUpdate(
                    { number: t.number, source: t.source, destination: t.destination },
                    { 
                        $setOnInsert: {
                            name: t.name,
                            number: t.number,
                            source: t.source,
                            destination: t.destination,
                            departureTime: t.departureTime,
                            arrivalTime: t.arrivalTime,
                            totalSeats: t.totalSeats,
                            availableSeats: t.availableSeats,
                            basePrice: t.basePrice,
                            bookedSeats: []
                        }
                    },
                    { upsert: true, new: true }
                );
            }));
            return res.json(savedTrains);
        }

        // 2. Fallback to MongoDB
        let query = {};
        if (source) query.source = new RegExp(source, 'i');
        if (destination) query.destination = new RegExp(destination, 'i');
        
        if (date) {
            // Ensure local timezone parsing is robust
            const searchDate = new Date(date);
            if (!isNaN(searchDate.getTime())) {
                const start = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 0, 0, 0, 0);
                const end = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59, 999);
                query.departureTime = { $gte: start, $lte: end };
            }
        }
        
        const trains = await Train.find(query);
        res.json(trains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTrain = async (req, res) => {
    try {
        await Train.findByIdAndDelete(req.params.id);
        res.json({ message: 'Train removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTrain = async (req, res) => {
    try {
        const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrainBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ train: req.params.id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const confirmed = bookings.filter(b => b.status === 'Confirmed');
        const totalRevenue = confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        res.json({
            bookings,
            stats: {
                totalBookings: bookings.length,
                confirmedBookings: confirmed.length,
                cancelledBookings: bookings.length - confirmed.length,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrainStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const train = await Train.findById(id);
        const trainNumber = train ? train.number : id;
        
        const status = await railwayApiService.getLiveStatus(trainNumber);
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
