import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { trainAPI, bookingAPI } from '../services/api';
import BookingModal from '../components/dashboard/BookingModal';
import LiveStatusModal from '../components/dashboard/LiveStatusModal';

const multiplierMap = { 'General': 1, '3E': 2, '3A': 2.5, '2A': 3, '1A': 4 };
const cities = ["Agra", "Ahmedabad", "Bangalore", "Bhopal", "Chennai", "Hyderabad", "Jaipur", "Kolkata", "Lucknow", "Mumbai", "New Delhi", "Patna", "Pune", "Varanasi"];

function Dashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'bookings'
  const hasAuth = !!localStorage.getItem('token');
  
  // Search State
  const [searchParams, setSearchParams] = useState({
    source: queryParams.get('source') || '',
    destination: queryParams.get('destination') || '',
    date: queryParams.get('date') || ''
  });
  const [trains, setTrains] = useState([]);
  
  // My Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Live Status State
  const [liveStatus, setLiveStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);

  useEffect(() => {
    if (activeTab === 'search') {
      fetchTrains();
    } else {
      fetchMyBookings();
    }
  }, [activeTab]);

  const fetchTrains = async () => {
    setIsLoading(true);
    try {
      const res = await trainAPI.getTrains(searchParams);
      setTrains(res.data);
    } catch (error) {
      toast.error('Failed to load trains');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingAPI.getUserBookings();
      setMyBookings(res.data);
    } catch (error) {
      toast.error('Failed to load your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackTrain = async (trainId) => {
      try {
          const res = await trainAPI.getTrainStatus(trainId);
          setLiveStatus(res.data);
          setShowStatusModal(true);
      } catch (error) {
          toast.error('Failed to fetch live status');
      }
  };

  const handleSearchChange = (e) => setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrains();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(id);
      toast.success('Booking Cancelled');
      fetchMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const handleDownloadTicket = async (id) => {
    try {
      const response = await bookingAPI.downloadTicket(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF ticket');
    }
  };

  // --- BOOKING FLOW ---
  const startBooking = (train) => {
    setSelectedTrain(train);
    setShowModal(true);
  };

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <div className="flex gap-4 mb-8">
        <button className={`btn w-auto ${activeTab === 'search' ? 'bg-[var(--primary)]' : 'bg-gray-400'}`} onClick={() => setActiveTab('search')}>Search Trains</button>
        {hasAuth && <button className={`btn w-auto ${activeTab === 'bookings' ? 'bg-[var(--primary)]' : 'bg-gray-400'}`} onClick={() => setActiveTab('bookings')}>My Bookings</button>}
      </div>

      {activeTab === 'search' && (
        <>
          <div className="header-actions">
            <h1>Search Trains</h1>
          </div>
          <form className="search-box" onSubmit={handleSearch}>
            <select name="source" className="form-control" value={searchParams.source} onChange={handleSearchChange} required>
              <option value="" disabled>Source Station</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="destination" className="form-control" value={searchParams.destination} onChange={handleSearchChange} required>
              <option value="" disabled>Destination Station</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" name="date" className="form-control" value={searchParams.date} onChange={handleSearchChange} />
            <button type="submit" className="btn" style={{ width: 'auto' }}>Search</button>
          </form>

          <div className="grid">
            {isLoading ? (
                Array.from({length: 6}).map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : trains.length === 0 ? <p>No trains found.</p> : trains.map(t => (
              <div key={t._id} className="card train-card">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                      <div className="font-bold text-lg">🚂 {t.name} <span className="text-sm text-gray-500">({t.number})</span></div>
                      <div className={`badge ${t.availableSeats > 0 ? 'success' : 'danger'}`}>
                        {t.availableSeats > 0 ? `Available: ${t.availableSeats}` : 'Train Full'}
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between items-center font-semibold mb-2">
                          <div>{t.source}</div>
                          <div>➡️</div>
                          <div>{t.destination}</div>
                      </div>
                      <div className="text-sm text-gray-600 my-2">
                          🕒 Departs: {new Date(t.departureTime).toLocaleString()}<br/>
                          🏁 Arrives: {new Date(t.arrivalTime).toLocaleString()}
                      </div>
                      <div className="font-bold mt-2" style={{color: 'var(--primary)'}}>Base Fare: ₹{t.basePrice}</div>
                  </div>
                  {hasAuth ? (
                      <button className="btn mt-4" onClick={() => startBooking(t)}>Select Coaches</button>
                  ) : (
                      <button className="btn mt-4" style={{ background: '#9ca3af' }} onClick={() => window.location.href = '/auth'}>Login to Book</button>
                  )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <>
          <h1 className="mb-6">My Bookings</h1>
          <div className="grid">
            {isLoading ? (
                Array.from({length: 4}).map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : myBookings.length === 0 ? <p>No bookings found.</p> : myBookings.map(b => (
              <div key={b._id} className="card train-card">
                  <div className="flex justify-between border-b pb-2 mb-2">
                      <div className="font-bold">Train: {b.train ? b.train.name : 'N/A'} <span className={`badge ${b.status === 'Confirmed' ? 'success' : 'danger'} ml-2`}>{b.status}</span></div>
                      <div className="font-bold" style={{color: 'var(--primary)'}}>₹{b.totalAmount}</div>
                  </div>
                  <div className="mt-4">
                      <p><strong>Passengers:</strong> {b.passengers.map(p => `${p.name} (${p.seatNumber})`).join(', ')}</p>
                      <p className="text-sm text-gray-500 mt-2">Booked on: {new Date(b.createdAt).toLocaleDateString()}</p>
                      {b.status !== 'Cancelled' && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <button className="btn btn-danger" style={{width: 'auto', flex: 1}} onClick={() => handleCancelBooking(b._id)}>Cancel</button>
                          <button className="btn" style={{width: 'auto', background: 'var(--primary)', flex: 1}} onClick={() => handleDownloadTicket(b._id)}>PDF Ticket</button>
                          <button className="btn" style={{width: '100%', background: '#10b981', marginTop: '0.5rem'}} onClick={() => handleTrackTrain(b.train?._id)}>📍 Track Train</button>
                        </div>
                      )}
                  </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && selectedTrain && (
        <BookingModal 
          train={selectedTrain} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); fetchTrains(); }} 
        />
      )}

      <LiveStatusModal liveStatus={liveStatus} onClose={() => setShowStatusModal(false)} />
    </div>
  );
}

export default Dashboard;
