const Booking = require('../models/Booking');
const Train = require('../models/Train');
const sendEmail = require('../utils/emailService');
const pdfService = require('../utils/pdfService');

const getMultiplier = (coachCode) => {
    if(coachCode === 'General') return 1;
    if(coachCode === '3E') return 2;
    if(coachCode === '3A') return 2.5;
    if(coachCode === '2A') return 3;
    if(coachCode === '1A') return 4;
    return 1;
};

exports.createBooking = async (req, res) => {
    try {
        const { trainId, passengers } = req.body;
        
        const train = await Train.findById(trainId);
        if (!train) return res.status(404).json({ message: 'Train not found' });

        if (new Date() > new Date(train.departureTime)) {
            return res.status(400).json({ message: 'Cannot book tickets for a train that has already departed.' });
        }

        if (!passengers || passengers.length === 0) {
            return res.status(400).json({ message: 'No passengers provided.' });
        }

        const seatsCount = passengers.length;
        const seatNumbers = passengers.map(p => p.seatNumber);

        const alreadyBooked = seatNumbers.some(seat => train.bookedSeats.includes(seat));
        if (alreadyBooked) {
            return res.status(400).json({ message: 'One or more selected seats are already booked.' });
        }
        
        // Calculate dynamic pricing
        let totalAmount = 0;
        const enrichedPassengers = passengers.map(p => {
            const coach = p.seatNumber.split('-')[0];
            const price = Math.round(train.basePrice * getMultiplier(coach));
            totalAmount += price;
            return {
                name: p.name,
                age: p.age,
                seatNumber: p.seatNumber,
                price: price
            };
        });

        // Confirm seats natively
        train.availableSeats -= seatsCount;
        train.bookedSeats.push(...seatNumbers);
        await train.save();

        const booking = await Booking.create({
            user: req.user.id,
            train: trainId,
            seatsCount,
            passengers: enrichedPassengers,
            totalAmount: totalAmount,
            status: 'Confirmed',
            paymentStatus: 'Success'
        });

        const populatedBooking = await booking.populate('train user');

        // Generate PDF Ticket
        let ticketPdfBuffer = null;
        try {
            ticketPdfBuffer = await pdfService.generateTicketPDF(populatedBooking);
        } catch (pdfErr) {
            console.error('Failed to generate PDF:', pdfErr);
        }

        // Extract a string mapping of names to seats for email
        let passengerSummary = enrichedPassengers.map(p => `${p.name} (Seat ${p.seatNumber})`).join(', ');

        try {
            const emailOptions = {
                email: req.user.email || populatedBooking.user.email,
                subject: 'Your Railyatri Ticket is Ready! 🚂',
                message: `Hello ${populatedBooking.user.name},\n\nPack your bags! Your booking for ${populatedBooking.train.name} (${populatedBooking.train.number}) is confirmed.\n\nDeparture: ${new Date(populatedBooking.train.departureTime).toLocaleString()}\nFrom: ${populatedBooking.train.source}\nTo: ${populatedBooking.train.destination}\n\nWe have attached your official E-Ticket PDF to this email for your journey.\n\nHappy travels,\nTeam Railyatri`
            };
            
            if (ticketPdfBuffer) {
                emailOptions.attachments = [
                    {
                        filename: `Ticket_${booking._id}.pdf`,
                        content: ticketPdfBuffer,
                        contentType: 'application/pdf'
                    }
                ];
            }

            await sendEmail(emailOptions);
        } catch(err) {
            console.error('Email failed: ', err);
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('train').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('train user')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        const train = await Train.findById(booking.train);
        
        const now = new Date();
        const departure = new Date(train.departureTime);
        const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

        if (hoursUntilDeparture < 4) {
            return res.status(400).json({ message: 'Cancellation not allowed less than 4 hours before departure.' });
        }

        let refundPercentage = 0.50; // default 50% for 4-24 hours
        if (hoursUntilDeparture > 24) {
            refundPercentage = 0.75; // 75% for > 24 hours
        }
        
        const refundAmount = Math.round(booking.totalAmount * refundPercentage);
        const seatNumbers = booking.passengers.map(p => p.seatNumber);
        
        // Restore seats exactly back to database
        train.availableSeats += booking.seatsCount;
        if (seatNumbers && seatNumbers.length > 0) {
            train.bookedSeats = train.bookedSeats.filter(seat => !seatNumbers.includes(seat));
        }

        booking.status = 'Cancelled';
        await booking.save();
        
        // Cancellation Confirmation Email
        const populatedCancelledBooking = await booking.populate('train user');
        let passengerSummary = booking.passengers.map(p => `${p.name} (Seat ${p.seatNumber})`).join(', ');

        try {
            await sendEmail({
                email: req.user.email || populatedCancelledBooking.user.email,
                subject: 'Railyatri Booking Cancelled',
                message: `Hello ${populatedCancelledBooking.user.name},\n\nYour booking has been successfully Cancelled.\nTrain: ${populatedCancelledBooking.train.name} (${populatedCancelledBooking.train.number})\nSeats Refunded: ${booking.seatsCount}\nPassengers: ${passengerSummary}\nTotal Fare: ₹${booking.totalAmount}\nRefund Processing (${refundPercentage * 100}%): ₹${refundAmount}\nBooking ID: ${booking._id}\n\nHope to see you again soon.`
            });
        } catch(err) {
            console.error('Cancellation Email failed: ', err);
        }
        
        await train.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.downloadTicketPDF = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('train user');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const pdfBuffer = await pdfService.generateTicketPDF(booking);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket_${booking._id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Download Error:', error);
        res.status(500).json({ message: 'Could not generate PDF ticket.' });
    }
};
