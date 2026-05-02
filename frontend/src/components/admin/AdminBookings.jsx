import React from 'react';

export default function AdminBookings({ allBookings }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4c4e9] to-white mb-8">📋 All Bookings</h2>
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
         <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 backdrop-blur-md border-b border-white/10">
               <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Train / User</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Passengers</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amt</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
               </tr>
            </thead>
            <tbody>
               {allBookings.map(b => (
                   <tr key={b._id} className="border-t border-[#9b89b340] hover:bg-[#9b89b30d]">
                      <td className="p-4">
                          <strong className="text-white">{b.train?.name || 'Unknown'}</strong>
                          <div className="text-xs text-gray-400 mt-1">{b.user?.name || ''} ({b.user?.email || ''})</div>
                      </td>
                      <td className="p-4 text-sm text-[#c4b8d8]">
                          {b.passengers.map(p => <div key={p.seatNumber}>{p.name} ({p.seatNumber})</div>)}
                      </td>
                      <td className="p-4 text-[#d4c4e9] font-bold">₹{b.totalAmount}</td>
                      <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${b.status==='Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>{b.status}</span>
                      </td>
                   </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
