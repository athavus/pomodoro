import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedTimerDisplay = ({ time, paused }) => {
  const [displayTime, setDisplayTime] = useState(time);
  let prevTime = useRef(time);

  useEffect(() => {
    if (time !== prevTime.current) {
      setDisplayTime(time);
      prevTime.current = time;
    }
  }, [time]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStaxrt(2, "0"),
      seconds: secs.toString().padStart(2, "0")
    };
  };

  const currentTime = formatTime(displayTime);
  prevTime = formatTime(prevTime.current);

  const numberVariants = {
    initial: { opacity: 0, y: 50, rotateX: 90 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: { opacity: 0, y: -50, rotateX: -90 }
  };

  return (
    <div className="animated-timer flex items-center justify-center space-x-2">
      <div className="timer-digit flex space-x-1">
        {currentTime.minutes.split('').map((digit, index) => (
          <motion.div
            key={`minutes-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`}
            className="digit-container w-[1em] overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={numberVariants}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              damping: 15, 
              stiffness: 200 
            }}
          >
            {digit}
          </motion.div>
        ))}
      </div>
      <div className="timer-separator mx-1">:</div>
      <div className="timer-digit flex space-x-1">
        {currentTime.seconds.split('').map((digit, index) => (
          <motion.div
            key={`seconds-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`}
            className="digit-container w-[1em] overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={numberVariants}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              damping: 15, 
              stiffness: 200 
            }}
          >
            {digit}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedTimerDisplay;