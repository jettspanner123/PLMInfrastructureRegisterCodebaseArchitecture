import React, { useRef } from 'react';
import { motion } from 'motion/react';
import splashScreenAnimation from '../../../../Assets/SplashScreenAnimation.webm?url';

export interface SplashScreenLogoStaticComponentProps {
  className?: string;
  isReadyToDismiss: boolean;
  onLoopComplete: () => void;
}

export default function SplashScreenLogoStaticComponent({
  className = '',
  isReadyToDismiss,
  onLoopComplete,
}: SplashScreenLogoStaticComponentProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    if (isReadyToDismiss) {
      onLoopComplete();
      return;
    }
    // Data/minimum-duration isn't ready yet — play the animation again from the
    // start rather than cutting or freezing, and re-check once this loop ends too.
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center justify-center select-none ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="w-full max-w-xs sm:max-w-sm h-auto object-contain pointer-events-none"
      >
        <source src={splashScreenAnimation} type="video/webm" />
      </video>
    </motion.div>
  );
}
