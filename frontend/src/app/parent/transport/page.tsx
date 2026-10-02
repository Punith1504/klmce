"use client";

import { useEffect, useState, useRef } from 'react';
// Assuming `react-map-gl` and `mapbox-gl` are installed in the Next.js project
import { Map, Marker, NavigationControl } from 'react-map-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import { Bus, Bell, ShieldCheck, Navigation } from 'lucide-react';

// In production, this must be loaded via Next.js Environment Variables (NEXT_PUBLIC_MAPBOX_TOKEN)
const MAPBOX_TOKEN = "pk.eyJ1Ijoia2xtY2UiLCJhIjoiY214eHk3OXEyMGFjMjJub2IzZnR6M3A1bSJ9.XXXXXX_MOCK_TOKEN";

export default function FleetTrackingDashboard() {
  const [busPosition, setBusPosition] = useState({ lat: 12.9716, lng: 77.5946 });
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(5); // Minutes
  const wsRef = useRef<WebSocket | null>(null);

  // =========================================================
  // Linear Interpolation (Lerp) Engine
  // =========================================================
  // Telemetry is received at 1Hz to save bandwidth. 
  // Lerp mathematically smooths the marker animation on the client at 60FPS.
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    // 1. Establish Secure WebSocket Connection to FastAPI Telemetry Stream
    wsRef.current = new WebSocket(`ws://localhost:8000/api/v1/transport/ws/telemetry/stream?route_id=bus_12`);
    
    let animationFrameId: number;
    
    // Internal state for the animation loop
    let targetLat = busPosition.lat;
    let targetLng = busPosition.lng;
    let currentLat = busPosition.lat;
    let currentLng = busPosition.lng;

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update target coordinates when a new packet arrives
      targetLat = data.lat;
      targetLng = data.lng;
      setSpeed(data.speed);
    };

    // 2. 60 FPS Render Loop
    const animateMarker = () => {
      currentLat = lerp(currentLat, targetLat, 0.1); // 10% interpolation per frame
      currentLng = lerp(currentLng, targetLng, 0.1);
      
      setBusPosition({ lat: currentLat, lng: currentLng });
      animationFrameId = requestAnimationFrame(animateMarker);
    };

    // Kickoff render loop
    animateMarker();

    return () => {
      cancelAnimationFrame(animationFrameId);
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white font-sans">
      
      {/* HUD Header */}
      <div className="bg-[#111827] border-b border-[#1f2937] p-6 flex justify-between items-center shadow-2xl z-10 relative">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <Navigation className="w-6 h-6 mr-3 text-blue-500" />
            Live Transit Tracker
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Route 12 • North Campus Shuttle</p>
        </div>
        
        <div className="flex space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold tracking-wider mb-1">CURRENT SPEED</span>
            <span className="text-2xl font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
              {speed.toFixed(0)} <span className="text-sm">km/h</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold tracking-wider mb-1">ETA TO YOUR STOP</span>
            <span className="text-2xl font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              {eta} <span className="text-sm">Mins</span>
            </span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <Map
          initialViewState={{
            longitude: 77.5946,
            latitude: 12.9716,
            zoom: 15,
            pitch: 45 // 3D Tilt for modern aesthetic
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          
          {/* Geofence Boundary Visualization */}
          {/* This renders the 1km radius trigger zone around the student's stop */}
          <Marker longitude={77.5946} latitude={12.9716} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-64 h-64 bg-blue-500/10 border border-blue-500/30 rounded-full animate-pulse"></div>
              <div className="absolute w-48 h-48 bg-blue-500/5 border border-blue-500/20 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,1)] z-10"></div>
            </div>
          </Marker>

          {/* Real-Time Bus Marker (Animated via Lerp) */}
          <Marker longitude={busPosition.lng} latitude={busPosition.lat} anchor="bottom">
            <div className="relative">
              {/* Radar Ping Effect */}
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              {/* Core Icon */}
              <div className="relative bg-emerald-500 text-white p-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-emerald-300">
                <Bus className="w-6 h-6" />
              </div>
            </div>
          </Marker>
        </Map>

        {/* Floating Security & Status Overlay */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-[#111827]/90 backdrop-blur-md border border-[#1f2937] px-6 py-4 rounded-full shadow-2xl flex items-center space-x-6 z-20">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-sm text-gray-200">1km Geofencing Active</span>
          </div>
          <div className="h-5 w-px bg-gray-700"></div>
          <div className="flex items-center space-x-2 cursor-pointer group">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-semibold text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Alerts Configured</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
