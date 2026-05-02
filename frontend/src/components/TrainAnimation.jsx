import { useEffect, useRef } from 'react';

const trainHTML = (
  <>
    <svg className="track-rails" viewBox="0 0 1536 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '24px' }}>
        <rect x="0" y="4" width="1536" height="4" rx="2" fill="#dfd7e8"/>
        <rect x="0" y="16" width="1536" height="4" rx="2" fill="#dfd7e8"/>
    </svg>
    <div className="track-progress" id="trackProgress" style={{ position: 'absolute', bottom: '6px', left: 0, height: '4px', background: 'linear-gradient(to right, #9b89b3, #d4c4e9)', borderRadius: '2px', transition: 'width 0.1s linear' }}></div>
    <div className="train-mover" id="trainMover" style={{ position: 'absolute', bottom: '18px', left: 0, willChange: 'transform', transition: 'transform 0.05s linear' }}>
        <svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
            <circle className="smoke1" cx="28" cy="18" r="7" fill="rgba(212,196,233,0.7)"/>
            <circle className="smoke2" cx="22" cy="12" r="5" fill="rgba(212,196,233,0.5)"/>
            <circle className="smoke3" cx="35" cy="8"  r="4" fill="rgba(212,196,233,0.4)"/>
            <rect x="22" y="28" width="10" height="14" rx="2" fill="#4a4059"/>
            <rect x="10" y="38" width="90" height="36" rx="8" fill="#9b89b3"/>
            <rect x="95" y="30" width="52" height="44" rx="6" fill="#83709c"/>
            <rect x="100" y="36" width="18" height="14" rx="3" fill="#fdfbf7" opacity="0.9"/>
            <rect x="123" y="36" width="18" height="14" rx="3" fill="#fdfbf7" opacity="0.9"/>
            <rect x="101" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
            <rect x="124" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
            <ellipse cx="50" cy="38" rx="14" ry="8" fill="#83709c"/>
            <circle cx="10" cy="52" r="5" fill="#f0c38e"/>
            <circle cx="10" cy="52" r="3" fill="white"/>
            <rect x="0"   y="66" width="12" height="4" rx="2" fill="#4a4059"/>
            <rect x="148" y="66" width="12" height="4" rx="2" fill="#4a4059"/>

            <g transform="translate(30,72)">
                <circle className="wheel-spin" cx="0" cy="0" r="13" fill="#4a4059"/>
                <circle cx="0" cy="0" r="6" fill="#857a96"/>
                <line className="wheel-spin" x1="-11" y1="0" x2="11" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                <line className="wheel-spin" x1="0" y1="-11" x2="0" y2="11" stroke="#fdfbf7" strokeWidth="2"/>
            </g>
            <g transform="translate(62,72)">
                <circle className="wheel-spin" cx="0" cy="0" r="13" fill="#4a4059"/>
                <circle cx="0" cy="0" r="6" fill="#857a96"/>
                <line className="wheel-spin" x1="-11" y1="0" x2="11" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                <line className="wheel-spin" x1="0" y1="-11" x2="0" y2="11" stroke="#fdfbf7" strokeWidth="2"/>
            </g>
            <g transform="translate(105,72)">
                <circle className="wheel-spin" cx="0" cy="0" r="11" fill="#4a4059"/>
                <circle cx="0" cy="0" r="5" fill="#857a96"/>
                <line className="wheel-spin" x1="-9" y1="0" x2="9" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                <line className="wheel-spin" x1="0" y1="-9" x2="0" y2="9" stroke="#fdfbf7" strokeWidth="2"/>
            </g>
            <g transform="translate(133,72)">
                <circle className="wheel-spin" cx="0" cy="0" r="11" fill="#4a4059"/>
                <circle cx="0" cy="0" r="5" fill="#857a96"/>
                <line className="wheel-spin" x1="-9" y1="0" x2="9" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                <line className="wheel-spin" x1="0" y1="-9" x2="0" y2="9" stroke="#fdfbf7" strokeWidth="2"/>
            </g>
        </svg>
    </div>
  </>
);

export default function TrainAnimation({ showStations = false }) {
  const moverRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const styleObj = document.createElement('style');
    styleObj.innerHTML = `
      .train-track-container { position: fixed; bottom: 0; left: 0; width: 100vw; height: 120px; z-index: 9999; pointer-events: none; }
      @keyframes spin-wheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .wheel-spin { animation: spin-wheel 0.7s linear infinite; transform-origin: 0px 0px; }
      @keyframes puff { 0% { opacity: 0.8; transform: translate(0, 0) scale(0.5); } 100% { opacity: 0; transform: translate(-8px, -30px) scale(1.4); } }
      .smoke1 { animation: puff 1.2s ease-out infinite; }
      .smoke2 { animation: puff 1.2s ease-out 0.4s infinite; }
      .smoke3 { animation: puff 1.2s ease-out 0.8s infinite; }
      .station-marker { position: absolute; bottom: 20px; width: 12px; height: 12px; background: var(--primary, #9b89b3); border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(155,137,179,0.7); }
      .station-label { position: absolute; bottom: 36px; font-size: 10px; font-family: Inter, sans-serif; color: var(--primary, #9b89b3); font-weight: 700; transform: translateX(-50%); white-space: nowrap; }
    `;
    document.head.appendChild(styleObj);

    const updateTrain = () => {
      const mover = moverRef.current;
      const progress = progressRef.current;
      if (!mover || !progress) return;

      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = totalH > 0 ? Math.min(Math.max(window.scrollY / totalH, 0), 1) : 0;
      
      const maxX = window.innerWidth - 175;
      const posX = pct * maxX;
      mover.style.transform = `translate3d(${posX}px, 0, 0)`;
      progress.style.width = `${pct * 100}%`;
    };

    window.addEventListener('scroll', updateTrain, { passive: true });
    window.addEventListener('resize', updateTrain, { passive: true });
    
    // Initial position
    setTimeout(updateTrain, 50);

    return () => {
      window.removeEventListener('scroll', updateTrain);
      window.removeEventListener('resize', updateTrain);
      document.head.removeChild(styleObj);
    };
  }, []);

  return (
    <div className="train-track-container" style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '120px', zIndex: 9999, pointerEvents: 'none' }}>
      <svg className="track-rails" viewBox="0 0 1536 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '24px' }}>
          <rect x="0" y="4" width="1536" height="4" rx="2" fill="#dfd7e8"/>
          <rect x="0" y="16" width="1536" height="4" rx="2" fill="#dfd7e8"/>
      </svg>
      <div className="track-progress" ref={progressRef} style={{ position: 'absolute', bottom: '6px', left: 0, height: '4px', background: 'linear-gradient(to right, #9b89b3, #d4c4e9)', borderRadius: '2px', transition: 'width 0.1s linear' }}></div>
      <div className="train-mover" ref={moverRef} style={{ position: 'absolute', bottom: '18px', left: 0, willChange: 'transform', transition: 'transform 0.05s linear' }}>
          <svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
              <circle className="smoke1" cx="28" cy="18" r="7" fill="rgba(212,196,233,0.7)"/>
              <circle className="smoke2" cx="22" cy="12" r="5" fill="rgba(212,196,233,0.5)"/>
              <circle className="smoke3" cx="35" cy="8"  r="4" fill="rgba(212,196,233,0.4)"/>
              <rect x="22" y="28" width="10" height="14" rx="2" fill="#4a4059"/>
              <rect x="10" y="38" width="90" height="36" rx="8" fill="#9b89b3"/>
              <rect x="95" y="30" width="52" height="44" rx="6" fill="#83709c"/>
              <rect x="100" y="36" width="18" height="14" rx="3" fill="#fdfbf7" opacity="0.9"/>
              <rect x="123" y="36" width="18" height="14" rx="3" fill="#fdfbf7" opacity="0.9"/>
              <rect x="101" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
              <rect x="124" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
              <ellipse cx="50" cy="38" rx="14" ry="8" fill="#83709c"/>
              <circle cx="10" cy="52" r="5" fill="#f0c38e"/>
              <circle cx="10" cy="52" r="3" fill="white"/>
              <rect x="0"   y="66" width="12" height="4" rx="2" fill="#4a4059"/>
              <rect x="148" y="66" width="12" height="4" rx="2" fill="#4a4059"/>

              <g transform="translate(30,72)">
                  <circle className="wheel-spin" cx="0" cy="0" r="13" fill="#4a4059"/>
                  <circle cx="0" cy="0" r="6" fill="#857a96"/>
                  <line className="wheel-spin" x1="-11" y1="0" x2="11" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                  <line className="wheel-spin" x1="0" y1="-11" x2="0" y2="11" stroke="#fdfbf7" strokeWidth="2"/>
              </g>
              <g transform="translate(62,72)">
                  <circle className="wheel-spin" cx="0" cy="0" r="13" fill="#4a4059"/>
                  <circle cx="0" cy="0" r="6" fill="#857a96"/>
                  <line className="wheel-spin" x1="-11" y1="0" x2="11" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                  <line className="wheel-spin" x1="0" y1="-11" x2="0" y2="11" stroke="#fdfbf7" strokeWidth="2"/>
              </g>
              <g transform="translate(105,72)">
                  <circle className="wheel-spin" cx="0" cy="0" r="11" fill="#4a4059"/>
                  <circle cx="0" cy="0" r="5" fill="#857a96"/>
                  <line className="wheel-spin" x1="-9" y1="0" x2="9" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                  <line className="wheel-spin" x1="0" y1="-9" x2="0" y2="9" stroke="#fdfbf7" strokeWidth="2"/>
              </g>
              <g transform="translate(133,72)">
                  <circle className="wheel-spin" cx="0" cy="0" r="11" fill="#4a4059"/>
                  <circle cx="0" cy="0" r="5" fill="#857a96"/>
                  <line className="wheel-spin" x1="-9" y1="0" x2="9" y2="0" stroke="#fdfbf7" strokeWidth="2"/>
                  <line className="wheel-spin" x1="0" y1="-9" x2="0" y2="9" stroke="#fdfbf7" strokeWidth="2"/>
              </g>
          </svg>
      </div>
      {showStations && (
        <>
          <div className="station-marker" style={{ left: '0%' }} id="sm1"></div>
          <div className="station-label" style={{ left: '0%' }} id="sl1">🚉 Search</div>
          <div className="station-marker" style={{ left: '33%' }} id="sm2"></div>
          <div className="station-label" style={{ left: '33%' }} id="sl2">🚉 Features</div>
          <div className="station-marker" style={{ left: '66%' }} id="sm3"></div>
          <div className="station-label" style={{ left: '66%' }} id="sl3">🚉 Booking</div>
          <div className="station-marker" style={{ left: 'calc(100% - 12px)' }} id="sm4"></div>
          <div className="station-label" style={{ left: 'calc(100% - 12px)' }} id="sl4">🚉 Dashboard</div>
        </>
      )}
    </div>
  );
}
