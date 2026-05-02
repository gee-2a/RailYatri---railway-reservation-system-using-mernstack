import React from 'react';
import { FaTrain, FaTicketAlt, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaEye } from 'react-icons/fa';

export default function AdminOverview({ analytics, trains, trainStats, viewTrainBookings }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4c4e9] to-white mb-8">📊 Overview Dashboard</h2>
      
      {analytics ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { icon: <FaTrain className="text-[var(--primary)]" />, val: trains.length, title: 'Total Trains', glow: 'shadow-[0_0_20px_rgba(155,137,179,0.3)]' },
            { icon: <FaTicketAlt className="text-blue-400" />, val: analytics.totalBookings, title: 'Total Bookings', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]' },
            { icon: <FaCheckCircle className="text-green-400" />, val: analytics.confirmedBookings, title: 'Confirmed', glow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]' },
            { icon: <FaTimesCircle className="text-red-400" />, val: analytics.cancelledBookings, title: 'Cancelled', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]' },
            { icon: <FaRupeeSign className="text-yellow-400" />, val: `₹${analytics.totalRevenue.toLocaleString()}`, title: 'Total Revenue', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]' }
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 ${s.glow} relative overflow-hidden group mb-8`}>
              <div className="absolute -top-6 -right-6 text-7xl opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">{s.icon}</div>
              <div className="text-3xl mb-3 flex justify-center">{s.icon}</div>
              <div className="text-4xl font-black text-white tracking-tight">{s.val}</div>
              <div className="text-xs text-[#9b89b3] uppercase tracking-wider font-bold mt-2">{s.title}</div>
            </div>
          ))}
        </div>
      ) : <p className="text-[#9b89b3] animate-pulse">Loading analytics...</p>}

      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4c4e9] to-white mb-6 mt-4">🚂 Bookings per Train</h2>

      {trainStats.length === 0 ? <p className="text-[#9b89b3] animate-pulse">Loading per-train stats...</p> : (
        trainStats.map((d) => (
          <div key={d.train._id} className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-overlay filter blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4">
               <div className="flex-1">
                  <div className="font-bold text-white text-xl flex items-center gap-2"><FaTrain className="text-[var(--primary)]" /> {d.train.name} <span className="text-sm text-gray-400 font-normal">({d.train.number})</span></div>
                  <div className="text-sm text-gray-400 mt-1">{d.train.source} → {d.train.destination}</div>
                  {/* Visual Progress Bar */}
                  <div className="w-full max-w-md bg-[#110c18] rounded-full h-2.5 mt-4 border border-[#9b89b320] overflow-hidden relative">
                     <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-all duration-1000" style={{ width: `${Math.min(((d.stats?.confirmedBookings || 0) / d.train.totalSeats) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5 flex justify-between max-w-md">
                     <span>{d.stats?.confirmedBookings || 0} Booked</span>
                     <span>{d.train.totalSeats} Capacity</span>
                  </div>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-[#d4c4e9] border border-[#9b89b340] rounded-xl hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all shadow-lg" onClick={() => viewTrainBookings(d.train._id, d.train.name)}><FaEye /> View Data</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
               {[
                  { val: d.stats?.totalBookings || 0, label: 'Total', color: 'text-white' },
                  { val: d.stats?.confirmedBookings || 0, label: 'Confirmed', color: 'text-green-400' },
                  { val: d.stats?.cancelledBookings || 0, label: 'Cancelled', color: 'text-red-400' },
                  { val: `₹${(d.stats?.totalRevenue||0).toLocaleString()}`, label: 'Revenue', color: 'text-[#d4c4e9]' }
               ].map((s,i) => (
                 <div key={i} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                   <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                   <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
                 </div>
               ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
