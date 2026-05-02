import React from 'react';
import { FaListAlt, FaEdit, FaTrash } from 'react-icons/fa';

export default function AdminTrainManagement({ trains, setFormData, setShowAddForm, viewTrainBookings, openEditTrain, handleDeleteTrain }) {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4c4e9] to-white">🚂 Manage Trains</h2>
        <button 
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(155,137,179,0.4)] hover:scale-105 transition-transform" 
            onClick={() => { 
                setFormData({name:'', number:'', source:'', destination:'', departureTime:'', arrivalTime:'', totalSeats:'', basePrice:''}); 
                setShowAddForm(true); 
            }}>
            ＋ Add Train
        </button>
      </div>
      {trains.map(t => (
        <div key={t._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg group">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <div className="font-bold text-white text-lg">🚂 {t.name}</div>
                  <div className="text-sm text-gray-400 mt-1">#{t.number}</div>
              </div>
              <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors" onClick={() => viewTrainBookings(t._id, t.name)}><FaListAlt /> Bookings</button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-[#9b89b3]/20 text-[#d4c4e9] border border-[#9b89b3]/40 rounded-lg hover:bg-[#9b89b3]/40 transition-colors" onClick={() => openEditTrain(t)}><FaEdit /> Edit</button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors" onClick={() => handleDeleteTrain(t._id)}><FaTrash /> Delete</button>
              </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#b0a8c0]">
              <span>📍 {t.source} → {t.destination}</span>
              <span>🕒 {new Date(t.departureTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              <span>🏁 ₹{t.basePrice} base</span>
              <span>💺 {t.availableSeats}/{t.totalSeats} avail</span>
          </div>
        </div>
      ))}
    </div>
  );
}
