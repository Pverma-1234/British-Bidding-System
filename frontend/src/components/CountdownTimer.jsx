import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const formatTime = (ms) => {
  if (!ms || ms <= 0) return "Auction Ended";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

const calculateRemainingTime = (endTime) => {
  if (!endTime) return null;

  const now = new Date().getTime();
  const end = new Date(endTime).getTime();

  if (isNaN(end)) return null;

  const diff = end - now;

  return diff > 0 ? diff : 0;
};

const CountdownTimer = ({ rfq }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!rfq?.endTime || isExpired) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(t);
  }, [rfq?.endTime, isExpired]);

  useEffect(() => {
    if (!rfq) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(rfq.startTime).getTime();
      const end = new Date(rfq.endTime).getTime();

      const endedFromStatus = rfq.status === 'ENDED' || rfq.status === 'CLOSED' || rfq.status === 'AWARDED' || rfq.endedEarly || isNaN(end);

      if (endedFromStatus || now > end) {
        setIsExpired(true);
        setTimeLeft('Auction Ended');
        return;
      }

      if (now < start) {
        setIsExpired(false);
        setTimeLeft('Starts Soon');
        return;
      }

      const diff = calculateRemainingTime(rfq.endTime);
      
      if (!diff || diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Auction Ended');
        return;
      }

      setIsExpired(false);
      setTimeLeft(`Closing in: ${formatTime(diff)}`);
    };

    calculateTime();
    
    // Only run the timer if there's still a possibility of change
    let timer;
    if (rfq.status !== 'ENDED' && rfq.status !== 'CLOSED' && rfq.status !== 'AWARDED' && !rfq.endedEarly) {
       timer = setInterval(calculateTime, 1000);
    }
    return () => clearInterval(timer);
  }, [rfq]);

  if (!rfq) return null;

  return (
    <div
      style={{
        backgroundColor: isExpired ? '#FEE2E2' : '#EEF2FF',
        color: isExpired ? '#EF4444' : '#4F46E5',
        transition: 'all 0.3s ease',
        transform: flash ? 'scale(1.05)' : 'scale(1)',
        boxShadow: flash ? '0 0 10px rgba(79, 70, 229, 0.5)' : 'none'
      }}
      className="badge flex items-center gap-2 font-bold font-mono tracking-widest text-[#4F46E5]"
    >
      <span className="badge-text" style={{ color: isExpired ? '#EF4444' : '#4F46E5' }}>
        <Clock className={`w-3.5 h-3.5 ${flash && !isExpired ? 'animate-spin' : ''}`} />
        {timeLeft}
      </span>
    </div>
  );
};

export default CountdownTimer;
