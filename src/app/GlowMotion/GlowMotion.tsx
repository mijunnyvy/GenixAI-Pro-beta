'use client';

import React, { useState, useEffect, useRef } from 'react';

const GlowOcean = ({ isDark }: { isDark: boolean }) => {
  // تخزين الميل الخام
  const orientationRef = useRef({ gamma: 0, beta: 0 });

  // موقع التحويل النهائي (pixel offset)
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // عداد الوقت للحركة التذبذبية
  const timeRef = useRef(0);

  useEffect(() => {
    async function requestPermission() {
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        try {
          const response = await (DeviceMotionEvent as any).requestPermission();
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } catch (error) {
          console.error('Permission denied for device motion.');
        }
      } else {
        // For browsers that do not require permission
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    function handleOrientation(event: DeviceOrientationEvent) {
      orientationRef.current.gamma = event.gamma ? Math.max(Math.min(event.gamma, 45), -45) : 0;
      orientationRef.current.beta = event.beta ? Math.max(Math.min(event.beta, 45), -45) : 0;
    }

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      timeRef.current += 0.02; // زيادة الوقت

      // نحول الميل لقيم offset مع حركة موجية (دالة sin)
      const gammaWave = Math.sin(timeRef.current) * 10 + (orientationRef.current.gamma / 45) * 15;
      const betaWave = Math.cos(timeRef.current * 1.5) * 5 + (orientationRef.current.beta / 45) * 10;

      setOffset({
        x: gammaWave,
        y: betaWave,
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      <div
        className={`absolute w-64 h-64 ${isDark ? 'bg-purple-500' : 'bg-purple-400'} rounded-full opacity-20 blur-3xl pointer-events-none transition-transform duration-300 ease-out`}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          top: '25%',
          left: '25%',
        }}
      />
      <div
        className={`absolute w-80 h-80 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full opacity-15 blur-3xl pointer-events-none transition-transform duration-300 ease-out`}
        style={{
          transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`,
          bottom: '25%',
          right: '25%',
        }}
      />
    </>
  );
};

export default GlowOcean;
