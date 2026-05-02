import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { trainAPI, bookingAPI } from '../services/api';
import { FaTrain, FaListAlt, FaChartBar } from 'react-icons/fa';
import AdminOverview from '../components/admin/AdminOverview';
import AdminTrainManagement from '../components/admin/AdminTrainManagement';
import AdminBookings from '../components/admin/AdminBookings';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trains, setTrains] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trainStats, setTrainStats] = useState([]);
  const [menuOpen, setMenuOpen] = useState({ overview: false, trains: false, bookings: false });

  // Modal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTrainBookingsModal, setShowTrainBookingsModal] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', number: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', basePrice: '' });
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedTrainBookings, setSelectedTrainBookings] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAnalytics();
      fetchTrains().then(trainsData => {
        if (trainsData) fetchPerTrainStats(trainsData);
      });
    } else if (activeTab === 'trains') {
      fetchTrains();
    } else if (activeTab === 'allbookings') {
      fetchAllBookings();
    }
  }, [activeTab]);

  const fetchTrains = async () => {
    try {
      const res = await trainAPI.getTrains();
      setTrains(res.data);
      return res.data;
    } catch (e) {
      toast.error('Failed to load trains');
      return null;
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await trainAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (e) {
      toast.error('Failed to load analytics');
    }
  };

  const fetchPerTrainStats = async (trainsData) => {
    try {
      const stats = await Promise.all(trainsData.map(async (t) => {
        try {
          const res = await trainAPI.getTrainBookings(t._id);
          return { train: t, ...res.data };
        } catch {
          return { train: t, bookings: [], stats: {} };
        }
      }));
      setTrainStats(stats);
    } catch (e) {
      toast.error('Failed to sync per-train stats');
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await bookingAPI.getAllBookings();
      setAllBookings(res.data);
    } catch (e) {
      toast.error('Failed to fetch all bookings');
    }
  };

  const viewTrainBookings = async (trainId, trainName) => {
    setSelectedTrain({ _id: trainId, name: trainName });
    setShowTrainBookingsModal(true);
    setSelectedTrainBookings(null);
    try {
      const res = await trainAPI.getTrainBookings(trainId);
      setSelectedTrainBookings(res.data);
    } catch (e) {
      toast.error('Failed to load train bookings');
    }
  };

  const handleDeleteTrain = async (id) => {
    if (!window.confirm('Delete this train?')) return;
    try {
      await trainAPI.deleteTrain(id);
      toast.success('Train deleted');
      fetchTrains();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveTrain = async (e) => {
    e.preventDefault();
    try {
      if (showEditForm) {
        await trainAPI.updateTrain(selectedTrain._id, formData);
        toast.success('Train updated');
      } else {
        await trainAPI.createTrain(formData);
        toast.success('Train added');
      }
      setShowAddForm(false);
      setShowEditForm(false);
      fetchTrains();
    } catch (e) {
      toast.error('Failed to save train');
    }
  };

  const openEditTrain = (train) => {
    setSelectedTrain(train);
    setFormData({
      name: train.name, number: train.number, source: train.source, destination: train.destination,
      departureTime: new Date(train.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(train.arrivalTime).toISOString().slice(0, 16),
      totalSeats: train.totalSeats, basePrice: train.basePrice
    });
    setShowEditForm(true);
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', paddingTop: '70px', background: 'radial-gradient(circle at top right, #2a1f3d, #120d18)', color: '#e2e0e8' }}>
      
      {/* Sidebar */}
      <aside className="p-6 border-r border-white/10 w-64 bg-white/5 backdrop-blur-xl sticky top-[70px] shrink-0 shadow-2xl z-10" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <div className="text-xs font-bold tracking-widest text-[#9b89b3] uppercase mb-4 mt-2 cursor-pointer flex justify-between items-center hover:text-white transition-colors" onClick={() => setMenuOpen(p => ({...p, overview: !p.overview}))}>
            Overview <span className="text-[10px]">{menuOpen.overview ? '▼' : '▶'}</span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${menuOpen.overview ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <button className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition-all duration-300 ${activeTab==='dashboard'? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white font-bold shadow-[0_4px_15px_rgba(155,137,179,0.4)] translate-x-2' : 'text-[#c4b8d8] hover:bg-white/10 hover:translate-x-1'}`} onClick={() => setActiveTab('dashboard')}><FaChartBar /> Dashboard</button>
        </div>
        
        <div className="text-xs font-bold tracking-widest text-[#9b89b3] uppercase mt-6 mb-4 cursor-pointer flex justify-between items-center hover:text-white transition-colors" onClick={() => setMenuOpen(p => ({...p, trains: !p.trains}))}>
            Train Management <span className="text-[10px]">{menuOpen.trains ? '▼' : '▶'}</span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${menuOpen.trains ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <button className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition-all duration-300 ${activeTab==='trains'? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white font-bold shadow-[0_4px_15px_rgba(155,137,179,0.4)] translate-x-2' : 'text-[#c4b8d8] hover:bg-white/10 hover:translate-x-1'}`} onClick={() => setActiveTab('trains')}><FaTrain /> Manage Trains</button>
        </div>

        <div className="text-xs font-bold tracking-widest text-[#9b89b3] uppercase mt-6 mb-4 cursor-pointer flex justify-between items-center hover:text-white transition-colors" onClick={() => setMenuOpen(p => ({...p, bookings: !p.bookings}))}>
            Bookings <span className="text-[10px]">{menuOpen.bookings ? '▼' : '▶'}</span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${menuOpen.bookings ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <button className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition-all duration-300 ${activeTab==='allbookings'? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white font-bold shadow-[0_4px_15px_rgba(155,137,179,0.4)] translate-x-2' : 'text-[#c4b8d8] hover:bg-white/10 hover:translate-x-1'}`} onClick={() => setActiveTab('allbookings')}><FaListAlt /> All Bookings</button>
        </div>
      </aside>

      <main className="flex-1 p-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <AdminOverview 
             analytics={analytics} 
             trains={trains} 
             trainStats={trainStats} 
             viewTrainBookings={viewTrainBookings} 
          />
        )}

        {activeTab === 'trains' && (
          <AdminTrainManagement 
             trains={trains} 
             setFormData={setFormData} 
             setShowAddForm={setShowAddForm} 
             viewTrainBookings={viewTrainBookings} 
             openEditTrain={openEditTrain} 
             handleDeleteTrain={handleDeleteTrain} 
          />
        )}

        {activeTab === 'allbookings' && (
          <AdminBookings allBookings={allBookings} />
        )}
      </main>

      {/* MODALS */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-[#1e1628] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                <h3 className="text-2xl font-extrabold text-[#d4c4e9] mb-6">{showAddForm ? '➕ Add New Train' : '✏️ Edit Train'}</h3>
                <form onSubmit={handleSaveTrain}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Train Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Train Number</label>
                        <input type="text" name="number" value={formData.number} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Source</label>
                            <input type="text" name="source" value={formData.source} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Destination</label>
                            <input type="text" name="destination" value={formData.destination} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Departure</label>
                            <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3] [color-scheme:dark]" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Arrival</label>
                            <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleFormChange} required className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3] [color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Total Seats</label>
                            <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleFormChange} required min="1" className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#b0a8c0] mb-1">Base Price ₹</label>
                            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleFormChange} required min="1" className="w-full bg-white/5 border border-[#9b89b340] rounded-lg p-2 text-white outline-none focus:border-[#9b89b3]" />
                        </div>
                    </div>
                    <div className="flex gap-4 cursor-pointer">
                        <button type="submit" className="flex-1 bg-[var(--primary)] text-white p-3 rounded-lg font-bold hover:bg-[var(--primary-hover)]">Save</button>
                        <button type="button" className="flex-1 bg-red-500/80 text-white p-3 rounded-lg font-bold hover:bg-red-500" onClick={() => { setShowAddForm(false); setShowEditForm(false); }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {showTrainBookingsModal && selectedTrain && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-[#2a1f3d] border border-[#9b89b340] rounded-2xl w-full max-w-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#d4c4e9]">📋 {selectedTrain.name} — Bookings</h3>
                    <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg" onClick={() => setShowTrainBookingsModal(false)}>✕ Close</button>
                </div>
                {!selectedTrainBookings ? <p>Loading...</p> : (
                    <>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                             <div className="border border-[#9b89b340] rounded-lg p-4 text-center">
                               <div className="text-2xl font-bold text-white">{selectedTrainBookings.stats.totalBookings}</div>
                               <div className="text-xs text-gray-400 mt-1">Total</div>
                             </div>
                             <div className="border border-[#9b89b340] rounded-lg p-4 text-center">
                               <div className="text-2xl font-bold text-green-400">{selectedTrainBookings.stats.confirmedBookings}</div>
                               <div className="text-xs text-gray-400 mt-1">Confirmed</div>
                             </div>
                             <div className="border border-[#9b89b340] rounded-lg p-4 text-center">
                               <div className="text-2xl font-bold text-red-400">{selectedTrainBookings.stats.cancelledBookings}</div>
                               <div className="text-xs text-gray-400 mt-1">Cancelled</div>
                             </div>
                             <div className="border border-[#9b89b340] rounded-lg p-4 text-center">
                               <div className="text-2xl font-bold text-[#d4c4e9]">₹{selectedTrainBookings.stats.totalRevenue.toLocaleString()}</div>
                               <div className="text-xs text-gray-400 mt-1">Revenue</div>
                             </div>
                        </div>
                        <div className="w-full overflow-x-auto rounded-xl border border-[#9b89b340]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#9b89b320]">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-gray-400 uppercase">Passengers</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 uppercase">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTrainBookings.bookings.length === 0 ? <tr><td colSpan="3" className="p-4 text-center text-gray-400">No bookings</td></tr> : 
                                    selectedTrainBookings.bookings.map(b => (
                                       <tr key={b._id} className="border-t border-[#9b89b340]">
                                            <td className="p-3 text-sm text-[#c4b8d8]">{b.passengers.map(p => p.name).join(', ')}</td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${b.status==='Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>{b.status}</span></td>
                                            <td className="p-3 text-sm font-bold text-white">₹{b.totalAmount}</td>
                                       </tr> 
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
