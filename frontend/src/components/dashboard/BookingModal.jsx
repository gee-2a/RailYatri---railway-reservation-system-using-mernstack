import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { bookingAPI } from '../../services/api';

const multiplierMap = { 'General': 1, '3E': 2, '3A': 2.5, '2A': 3, '1A': 4 };

export default function BookingModal({ train, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [userSelectedSeats, setUserSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);

  const openCoach = (coachName, maxSeats) => {
    setSelectedCoach({ name: coachName, maxSeats });
    setStep(2);
  };

  const toggleSeat = (seatNum) => {
    if (userSelectedSeats.includes(seatNum)) {
      setUserSelectedSeats(userSelectedSeats.filter(s => s !== seatNum));
    } else {
      if (userSelectedSeats.length >= 6) {
        toast.warning('You can only select up to 6 seats at once.');
        return;
      }
      setUserSelectedSeats([...userSelectedSeats, seatNum]);
    }
  };

  const continueToPassengers = () => {
    if (userSelectedSeats.length === 0) return toast.warning('Please select at least one seat.');
    setPassengers(userSelectedSeats.map(seat => ({ seatNumber: seat, name: '', age: '' })));
    setStep(3);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPass = [...passengers];
    newPass[index][field] = value;
    setPassengers(newPass);
  };

  const calculateTotal = () => {
    return userSelectedSeats.reduce((sum, seat) => {
      const coach = seat.split('-')[0];
      return sum + Math.round(train.basePrice * multiplierMap[coach]);
    }, 0);
  };

  const confirmBooking = async () => {
    for (let p of passengers) {
      if (!p.name || !p.age) return toast.warning('Please fill in all passenger details!');
    }

    try {
      await bookingAPI.createBooking({
        trainId: train._id,
        passengers: passengers.map(p => ({ ...p, age: parseInt(p.age) }))
      });
      toast.success('Booking Confirmed! Check your email.');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  const renderSeatGrid = () => {
    if (!selectedCoach) return null;
    const isGeneral = selectedCoach.name === 'General';
    const berthTypes = isGeneral ? ['W', 'Mid', 'A', 'A', 'W'] : ['L', 'M', 'U', 'SL', 'SU'];
    const seatsHtml = [];

    for (let i = 1; i <= selectedCoach.maxSeats; i++) {
        const berthIdx = (i - 1) % 5;
        const berth = berthTypes[berthIdx];
        const seatNum = `${selectedCoach.name}-${i}${berth}`;
        const isBooked = train.bookedSeats && train.bookedSeats.includes(seatNum);
        const isSelected = userSelectedSeats.includes(seatNum);

        let className = `seat berth-${berth}`;
        if (isBooked) className += ' booked opacity-50 cursor-not-allowed';
        else if (isSelected) className += ' selected bg-blue-600 text-white border-blue-700';
        else className += ' available';

        seatsHtml.push(
          <div key={seatNum} className={className} 
               onClick={() => !isBooked && toggleSeat(seatNum)}
               style={isSelected ? {backgroundColor: 'var(--primary)', color: 'white'} : {}}>
             <div>{i}</div>
             <div style={{fontSize: '0.5rem', opacity: 0.8, fontWeight: 700}}>{berth}</div>
          </div>
        );

        if (berthIdx === 2) {
          seatsHtml.push(<div key={`aisle-${i}`} className="seat-aisle"></div>);
        }
    }
    return <div className="seat-grid">{seatsHtml}</div>;
  };

  return (
    <div className="modal active">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <h3>Book Ticket - {train.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Total Seats: {train.totalSeats} | Available Globally: {train.availableSeats}</p>
        
        {step === 1 && (
          <div>
            <h4>Select Coach</h4>
            <div className="train-composition">
                <div className="locopilot">Engine</div>
                {['General','3E','3A','2A','1A'].map(coach => (
                  <div key={coach} className="coach-box" onClick={() => openCoach(coach, coach==='General'?100:72)}>
                    {coach}<br/><span>₹{Math.round(train.basePrice * multiplierMap[coach])}</span>
                  </div>
                ))}
            </div>
            <div className="mt-6 text-right">
                <button className="btn btn-danger w-auto" onClick={onClose}>Cancel Booking</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
             <div className="flex justify-between items-center mb-4">
                <h4>Coach Layout: <span className="font-bold">{selectedCoach?.name}</span></h4>
                <button className="btn bg-gray-400 w-auto text-sm px-3 py-1" onClick={() => setStep(1)}>Back to Map</button>
            </div>
            <p>Select your seats (<span className="font-bold">{userSelectedSeats.length}</span> selected)</p>
            {renderSeatGrid()}
            <p className="text-sm text-gray-500 mt-4">* You can select up to 6 seats across different coaches.</p>
            <div className="mt-6">
                <button className="btn" onClick={continueToPassengers}>Continue to Passenger Details</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex justify-between items-center mb-4">
                <h4>Passenger Details</h4>
                <button className="btn bg-gray-400 w-auto text-sm px-3 py-1" onClick={() => setStep(2)}>Back to Seats</button>
            </div>
            
            <div className="max-h-64 overflow-y-auto pr-2">
              {passengers.map((p, idx) => (
                <div key={idx} className="bg-slate-50 p-4 border border-slate-200 rounded-lg mb-4">
                    <div className="flex justify-between mb-2">
                        <strong>Seat: {p.seatNumber}</strong>
                        <span className="font-bold" style={{color: 'var(--accent)'}}>₹{Math.round(train.basePrice * multiplierMap[p.seatNumber.split('-')[0]])}</span>
                    </div>
                    <div className="flex gap-4">
                        <input type="text" className="form-control" placeholder="Passenger Name" value={p.name} onChange={e => handlePassengerChange(idx, 'name', e.target.value)} required />
                        <input type="number" className="form-control max-w-[100px]" placeholder="Age" value={p.age} onChange={e => handlePassengerChange(idx, 'age', e.target.value)} min="1" max="120" required />
                    </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-4 rounded-lg mt-6 flex justify-between items-center">
                <div className="font-bold">Total Amount: <span style={{color: 'var(--primary)', fontSize: '1.25rem'}}>₹{calculateTotal()}</span></div>
                <button className="btn w-auto" onClick={confirmBooking}>Confirm & Pay</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
