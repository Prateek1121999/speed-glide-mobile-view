
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SpeedTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState('Ready to track');
  const [hasGeolocation, setHasGeolocation] = useState(true);
  
  // Check if geolocation is available in the browser
  useEffect(() => {
    if (!navigator.geolocation) {
      setHasGeolocation(false);
      setStatus('Geolocation is not supported by your browser');
    }
  }, []);

  // Toggle tracking state
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
    setIsTracking(!isTracking);
  };

  // Start tracking speed
  const startTracking = () => {
    setStatus('Waiting for GPS...');
    
    // This would be replaced with actual Geolocation API implementation
    // For now we'll simulate speed changes
    const simulateSpeedChange = () => {
      // Simulate increasing speed and then decreasing
      const randomChange = Math.random() * 5 - 1; // Random value between -1 and 4
      setSpeed(prevSpeed => {
        const newSpeed = Math.max(0, prevSpeed + randomChange);
        return parseFloat(newSpeed.toFixed(1));
      });
      setStatus('Tracking speed...');
    };

    // Simulate GPS data coming in
    setTimeout(() => {
      window.trackingInterval = setInterval(simulateSpeedChange, 2000);
    }, 1500);
  };

  // Stop tracking speed
  const stopTracking = () => {
    clearInterval(window.trackingInterval);
    setStatus('Tracking stopped');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Speed Tracker</h1>
        
        {/* Speed Display */}
        <div className="bg-black text-white text-center rounded-lg p-8 mb-6">
          <div className="text-5xl font-bold">{speed.toFixed(1)}</div>
          <div className="text-xl mt-2">km/h</div>
        </div>
        
        {/* Start/Stop Button */}
        <Button 
          onClick={toggleTracking}
          className={`w-full py-6 text-lg font-semibold ${
            isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={!hasGeolocation}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>
        
        {/* Status Message */}
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded text-gray-600 text-center">
          {status}
        </div>
      </Card>
    </div>
  );
};

// Required for TypeScript when using window.trackingInterval
declare global {
  interface Window {
    trackingInterval: NodeJS.Timeout;
  }
}

export default SpeedTracker;
