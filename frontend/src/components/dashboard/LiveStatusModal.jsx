import React from 'react';

export default function LiveStatusModal({ liveStatus, onClose }) {
  if (!liveStatus) return null;

  return (
    <div className="modal active">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h3>Live Train Status</h3>
        <p className="text-sm text-gray-500 mb-4">Train Number: {liveStatus.trainNumber}</p>
        
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg mb-4">
            <div className="flex justify-between mb-4">
                <strong>Status:</strong>
                <span className="font-bold text-green-600">{liveStatus.statusMessage}</span>
            </div>
            <div className="flex justify-between mb-4">
                <strong>Current Location:</strong>
                <span>{liveStatus.currentLocation}</span>
            </div>
            <div className="flex justify-between mb-2">
                <strong>Delay:</strong>
                <span className={liveStatus.delayMinutes > 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    {liveStatus.delayMinutes > 0 ? `${liveStatus.delayMinutes} mins` : "On Time"}
                </span>
            </div>
            <div className="text-xs text-gray-400 mt-4 text-center">
                Last Updated: {liveStatus.lastUpdated}
            </div>
        </div>

        <div className="mt-6 text-center">
            <button className="btn w-full" onClick={onClose}>Close Tracking</button>
        </div>
      </div>
    </div>
  );
}
