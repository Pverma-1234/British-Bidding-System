import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';

const TopLoader = () => {
  const location = useLocation();

  useEffect(() => {
    nprogress.start();
    
    // Simulate a slight delay to allow the loading bar to show during instant client-side navigation
    const timeoutId = setTimeout(() => {
      nprogress.done();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      nprogress.done();
    };
  }, [location.pathname]);

  return null;
};

export default TopLoader;
