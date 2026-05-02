const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

exports.generateTicketPDF = (booking) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Generate QR Code Buffer
            const qrData = JSON.stringify({
                bookingId: booking._id,
                train: booking.train.number,
                date: new Date(booking.train.departureTime).toLocaleDateString()
            });
            const qrImageBuffer = await QRCode.toBuffer(qrData);

            // Embed QR Code in the top right corner
            doc.image(qrImageBuffer, 460, 30, { width: 90 });

            // Header - Aligned left to prevent overlap with QR code
            doc.fontSize(25).font('Helvetica-Bold').text('Railway Reservation Ticket', 50, 45);
            
            doc.moveDown(2);

            // Status and ID
            doc.fontSize(12).font('Helvetica').text(`Status: ${booking.status}`, { align: 'right' });
            doc.text(`Booking ID: ${booking._id}`, { align: 'right' });
            doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleString()}`, { align: 'right' });
            doc.moveDown();

            // Train Details
            doc.fontSize(16).font('Helvetica-Bold').text('Train Details');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(12).font('Helvetica');
            doc.text(`Train Name: ${booking.train.name}`);
            doc.text(`Train Number: ${booking.train.number}`);
            doc.text(`Source: ${booking.train.source}`);
            doc.text(`Destination: ${booking.train.destination}`);
            doc.text(`Departure Time: ${new Date(booking.train.departureTime).toLocaleString()}`);
            doc.text(`Arrival Time: ${new Date(booking.train.arrivalTime).toLocaleString()}`);
            doc.moveDown();

            // Passenger Details
            doc.fontSize(16).font('Helvetica-Bold').text('Passenger Details');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(12).font('Helvetica');
            booking.passengers.forEach((p, index) => {
                doc.text(`${index + 1}. ${p.name} | Age: ${p.age} | Seat: ${p.seatNumber}`);
            });
            doc.moveDown();

            // Payment Details
            doc.fontSize(16).font('Helvetica-Bold').text('Payment Details');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(12).font('Helvetica-Bold').text(`Total Fare: INR ${booking.totalAmount}`);
            doc.moveDown(2);

            // Footer
            doc.fontSize(10).font('Helvetica-Oblique').text('Have a safe journey!', { align: 'center' });
            doc.text('This is a computer generated ticket. No signature is required.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
