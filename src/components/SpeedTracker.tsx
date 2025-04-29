
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "lucide-react";

const SpeedTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState('Ready to track');
  const [hasGeolocation, setHasGeolocation] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  
  // Check if geolocation is available in the browser
  useEffect(() => {
    if (!navigator.geolocation) {
      setHasGeolocation(false);
      setStatus('Geolocation is not supported by your browser');
    }
    
    // Cleanup on component unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
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

  // Start tracking speed using the Geolocation API
  const startTracking = () => {
    setStatus('Waiting for GPS...');
    setSpeed(0);
    lastPositionRef.current = null;
    
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          // Calculate speed
          if (lastPositionRef.current) {
            const prevPosition = lastPositionRef.current;
            const prevTime = prevPosition.timestamp;
            const prevCoords = prevPosition.coords;
            
            const currentTime = position.timestamp;
            const currentCoords = position.coords;
            
            // If the device provides speed directly, use it
            if (position.coords.speed !== null) {
              // Convert m/s to km/h
              const speedInKmh = position.coords.speed * 3.6;
              setSpeed(parseFloat(speedInKmh.toFixed(1)));
            } else {
              // Calculate speed based on distance and time
              const distance = calculateDistance(
                prevCoords.latitude,
                prevCoords.longitude,
                currentCoords.latitude,
                currentCoords.longitude
              );
              
              const timeSeconds = (currentTime - prevTime) / 1000;
              
              if (timeSeconds > 0) {
                // Calculate speed in km/h
                const speedInKmh = (distance / timeSeconds) * 3.6;
                setSpeed(parseFloat(speedInKmh.toFixed(1)));
              }
            }
          }
          
          lastPositionRef.current = position;
          setStatus('Tracking speed...');
        },
        (error) => {
          handleGeolocationError(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    } catch (error) {
      setStatus('Error starting GPS tracking');
      console.error('Geolocation error:', error);
    }
  };

  // Handle geolocation errors
  const handleGeolocationError = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus('Location access denied. Please enable GPS permissions.');
        break;
      case error.POSITION_UNAVAILABLE:
        setStatus('Location information unavailable.');
        break;
      case error.TIMEOUT:
        setStatus('Location request timed out.');
        break;
      default:
        setStatus('Unknown geolocation error.');
    }
    stopTracking();
    setIsTracking(false);
  };

  // Stop tracking speed
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus('Tracking stopped');
  };

  // Calculate distance between two points in kilometers using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  };

  // Convert degrees to radians
  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Navigation className="h-6 w-6" />
          Speed Tracker
        </h1>
        
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

// Required for TypeScript when using watchIdRef
declare global {
  interface Window {
    trackingInterval: NodeJS.Timeout;
  }
}

export default SpeedTracker;
