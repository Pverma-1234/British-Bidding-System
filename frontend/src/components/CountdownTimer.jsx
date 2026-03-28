import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';

const CountdownTimer = ({ targetDate, label = "Closing in" }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date(targetDate);

      if (isAfter(now, target)) {
        setIsExpired(true);
        setTimeLeft('Closed');
        return;
      }

      setIsExpired(false);
      setTimeLeft(formatDistanceToNow(target, { addSuffix: true }));
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      style={{
        backgroundColor: isExpired ? '#FEE2E2' : '#EEF2FF',
        color: isExpired ? '#EF4444' : '#4F46E5',
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{label}: {timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
