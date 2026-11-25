import React from 'react';
import { motion } from 'motion/react';
import weplmLogo from '../../../../Assets/weplm.jpeg';
import atlasCopcoLogo from '../../../../Assets/Images/AtlasCopcoLogo.webp';
import { useFrontendDesignSchema } from '../../../../Utilities/FrontendDesignSchemaUtility';

export interface SplashScreenLogoStaticComponentProps {
  className?: string;
}

export default function SplashScreenLogoStaticComponent({
  className = '',
}: SplashScreenLogoStaticComponentProps): React.JSX.Element {
  const frontendDesignSchema = useFrontendDesignSchema();
  const logoSrc = frontendDesignSchema === 'AtlasCopco' ? atlasCopcoLogo : weplmLogo;
  const logoAlt = frontendDesignSchema === 'AtlasCopco' ? 'Atlas Copco' : 'We.PLM';

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center justify-center select-none ${className}`}
    >
      <img
        src={logoSrc}
        alt={logoAlt}
        className="w-full max-w-xs sm:max-w-sm h-auto object-contain pointer-events-none"
      />
    </motion.div>
  );
}
