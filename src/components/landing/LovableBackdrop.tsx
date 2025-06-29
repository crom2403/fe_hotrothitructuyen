import { useEffect, useRef } from 'react';

// GSAP imports
declare const gsap: any;

const LovableBackdrop = () => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof gsap !== 'undefined') {
      // Subtle floating animation for the main gradient
      gsap.to('.main-gradient', {
        scale: 'random(0.95, 1.05)',
        duration: 'random(15, 25)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Gentle movement for overlay gradients
      gsap.to('.overlay-gradient-1', {
        x: 'random(-20, 20)',
        y: 'random(-20, 20)',
        duration: 'random(20, 30)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.overlay-gradient-2', {
        x: 'random(-30, 30)',
        y: 'random(-30, 30)',
        duration: 'random(25, 35)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 5,
      });

      // Subtle opacity shifts
      gsap.to('.gradient-overlay', {
        opacity: 'random(0.3, 0.7)',
        duration: 'random(10, 20)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 3,
      });

      // Gentle rotation for accent elements
      gsap.to('.accent-element', {
        rotation: 'random(-5, 5)',
        scale: 'random(0.9, 1.1)',
        duration: 'random(30, 45)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 2,
      });
    }
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <svg width="1" height="1" viewBox="0 0 1 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.0249688 0C0.0111789 0 0 0.0112775 0 0.0251889V0.851385C0 0.865297 0.0111789 0.876574 0.0249688 0.876574H0.179775V0.974811C0.179775 0.988723 0.190954 1 0.204744 1H0.975031C0.988821 1 1 0.988723 1 0.974811V0.157431C1 0.143519 0.988821 0.132242 0.975031 0.132242H0.810237V0.0251889C0.810237 0.0112775 0.799058 0 0.785268 0H0.0249688Z"
          fill="black"
        />
      </svg>
    </div>
  );

  return (
    <div ref={backdropRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main Lovable-style gradient background */}
      <div className="main-gradient absolute inset-0">
        {/* Primary gradient - matches Lovable's style */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% 70%, 
                #ff6b35 0%,
                #f7931e 15%,
                #ff6b6b 30%,
                #4ecdc4 50%,
                #45b7d1 70%,
                #2c3e50 90%,
                #1a252f 100%
              )
            `,
          }}
        />

        {/* Secondary gradient overlay for depth */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 80%, 
                rgba(255, 107, 53, 0.8) 0%,
                rgba(247, 147, 30, 0.6) 20%,
                rgba(255, 107, 107, 0.4) 40%,
                rgba(78, 205, 196, 0.3) 60%,
                rgba(69, 183, 209, 0.2) 80%,
                transparent 100%
              )
            `,
          }}
        />
      </div>

      {/* Overlay gradients for movement */}
      <div className="overlay-gradient-1 absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 60%, 
                rgba(255, 107, 53, 0.3) 0%,
                rgba(247, 147, 30, 0.2) 30%,
                transparent 70%
              )
            `,
          }}
        />
      </div>

      <div className="overlay-gradient-2 absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 70% 50%, 
                rgba(78, 205, 196, 0.4) 0%,
                rgba(69, 183, 209, 0.3) 40%,
                transparent 80%
              )
            `,
          }}
        />
      </div>

      {/* Subtle accent elements */}
      <div className="accent-element absolute top-1/4 left-1/4 w-96 h-96 opacity-20">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `
              radial-gradient(circle, 
                rgba(255, 107, 53, 0.3) 0%,
                rgba(247, 147, 30, 0.2) 50%,
                transparent 100%
              )
            `,
          }}
        />
      </div>

      <div className="accent-element absolute bottom-1/4 right-1/4 w-80 h-80 opacity-15">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `
              radial-gradient(circle, 
                rgba(78, 205, 196, 0.4) 0%,
                rgba(69, 183, 209, 0.3) 50%,
                transparent 100%
              )
            `,
          }}
        />
      </div>

      {/* Gradient overlays for subtle animation */}
      <div className="gradient-overlay absolute top-0 left-0 w-full h-full opacity-50">
        <div
          className="w-full h-full"
          style={{
            background: `
              linear-gradient(45deg, 
                rgba(255, 107, 53, 0.1) 0%,
                transparent 30%,
                rgba(78, 205, 196, 0.1) 70%,
                transparent 100%
              )
            `,
          }}
        />
      </div>

      <div className="gradient-overlay absolute top-0 left-0 w-full h-full opacity-40">
        <div
          className="w-full h-full"
          style={{
            background: `
              linear-gradient(-45deg, 
                transparent 0%,
                rgba(247, 147, 30, 0.1) 30%,
                transparent 60%,
                rgba(69, 183, 209, 0.1) 100%
              )
            `,
          }}
        />
      </div>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, 
              transparent 0%,
              transparent 60%,
              rgba(26, 37, 47, 0.2) 100%
            )
          `,
        }}
      />
    </div>
  );
};

export default LovableBackdrop;
