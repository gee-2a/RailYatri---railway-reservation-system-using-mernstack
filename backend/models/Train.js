const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    basePrice: { type: Number, required: true, default: 500 },
    bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);
