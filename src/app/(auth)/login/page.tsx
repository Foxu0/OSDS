'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '@/lib/demoUsers';

// --- Minimal Clean SVG Icons (Pure SVG - Zero Emojis) ---

const IconSun = ({ opacity = 1, color = '#F59E0B' }: { opacity?: number; color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
    <circle cx="12" cy="12" r="4" fill={color} fillOpacity={opacity > 0.6 ? 0.35 : 0.1} />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = ({ opacity = 1, color = '#93C5FD' }: { opacity?: number; color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={opacity > 0.6 ? color : 'none'} fillOpacity={0.25} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconUser = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
    <circle cx="16" cy="18" r="1" fill="currentColor" />
  </svg>
);

const IconCertificate = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <circle cx="15" cy="11" r="3" />
    <path d="M15 14l-1.5 4.5 2.5-1.5 2.5 1.5L17 14" />
    <line x1="6" y1="8" x2="10" y2="8" />
    <line x1="6" y1="12" x2="9" y2="12" />
  </svg>
);

const IconAttendance = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const IconApproval = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

// --- Mathematical LERP Interpolation Helper ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// --- Compact Draggable Horizontal Light/Dark Slider Component ---
interface ThemeSliderProps {
  progress: number; // 0.0 = Light, 1.0 = Dark
  onProgressChange: (p: number) => void;
  onSnap: (target: number) => void;
}

const ThemeSlider: React.FC<ThemeSliderProps> = ({ progress, onProgressChange, onSnap }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startProgressRef = useRef(0);
  const totalTravel = 34; // 62px track - 20px knob - 8px padding/margin

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startProgressRef.current = progress;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaProgress = deltaX / totalTravel;
    const nextProgress = Math.min(1, Math.max(0, startProgressRef.current + deltaProgress));
    onProgressChange(nextProgress);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const deltaX = Math.abs(e.clientX - startXRef.current);
    if (deltaX < 3) {
      // Direct click toggle
      onSnap(progress > 0.5 ? 0 : 1);
    } else {
      // Drag release snap to nearest mode
      onSnap(progress >= 0.5 ? 1 : 0);
    }
  };

  const handlePointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onSnap(progress >= 0.5 ? 1 : 0);
  };

  // Interpolated Styles for Track & Knob
  const trackBg = `rgba(${lerp(220, 10, progress)}, ${lerp(226, 18, progress)}, ${lerp(235, 36, progress)}, ${lerp(0.85, 0.65, progress)})`;
  const trackBorder = `rgba(${lerp(203, 255, progress)}, ${lerp(213, 255, progress)}, ${lerp(225, 255, progress)}, ${lerp(0.7, 0.2, progress)})`;
  const knobX = 3 + progress * totalTravel;
  const sunOpacity = lerp(1, 0.28, progress);
  const moonOpacity = lerp(0.28, 1, progress);

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      role="switch"
      aria-checked={progress > 0.5}
      aria-label="Toggle light or dark theme"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSnap(progress > 0.5 ? 0 : 1);
        }
      }}
      style={{
        position: 'relative',
        width: '62px',
        height: '26px',
        borderRadius: '9999px',
        background: trackBg,
        border: `1px solid ${trackBorder}`,
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        boxSizing: 'border-box',
        zIndex: 20
      }}
    >
      {/* Sun SVG Icon on Left */}
      <div style={{
        position: 'absolute',
        left: '6px',
        top: '50%',
        transform: `translateY(-50%) scale(${lerp(1.1, 0.85, progress)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <IconSun opacity={sunOpacity} color={progress < 0.5 ? '#F59E0B' : '#94A3B8'} />
      </div>

      {/* Moon SVG Icon on Right */}
      <div style={{
        position: 'absolute',
        right: '6px',
        top: '50%',
        transform: `translateY(-50%) scale(${lerp(0.85, 1.1, progress)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <IconMoon opacity={moonOpacity} color={progress > 0.5 ? '#93C5FD' : '#94A3B8'} />
      </div>

      {/* Draggable Circular Knob */}
      <div
        style={{
          position: 'absolute',
          left: `${knobX}px`,
          top: '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          pointerEvents: 'none',
          willChange: 'left'
        }}
      />
    </div>
  );
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const router = useRouter();

  // --- Real-time Draggable Theme State (0.0 = Light, 1.0 = Dark) ---
  // Default to 1.0 (Dark Mode) matching dark blue aesthetic
  const [themeProgress, setThemeProgress] = useState(1.0);
  const animFrameRef = useRef<number | null>(null);

  const handleSnapTheme = useCallback((target: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const start = themeProgress;
    const startTime = performance.now();
    const duration = 220; // ms cubic ease-out

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progressRatio, 3);
      const current = start + (target - start) * ease;
      setThemeProgress(current);

      if (progressRatio < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setThemeProgress(target);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [themeProgress]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Please check your Student ID or Email and password.');
        setLoading(false);
      } else {
        router.replace('/dashboard-redirect');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoSelect = (user: typeof DEMO_USERS[0]) => {
    setIdentifier(user.studentNumber || user.email);
    setPassword(user.password);
    setError('');
  };

  // --- Interpolated Theme Tokens ---
  const t = themeProgress;
  const cardBg = `rgba(${lerp(255, 15, t)}, ${lerp(255, 23, t)}, ${lerp(255, 42, t)}, ${lerp(0.92, 0.65, t)})`;
  const cardBorder = `rgba(255, 255, 255, ${lerp(0.7, 0.18, t)})`;
  const cardShadow = `0 25px 50px rgba(0, 0, 0, ${lerp(0.18, 0.45, t)})`;
  const textTitle = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  const textSubtitle = `rgba(${lerp(71, 226, t)}, ${lerp(85, 232, t)}, ${lerp(105, 240, t)}, ${lerp(0.9, 0.82, t)})`;
  const textStrong = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  const dividerColor = `rgba(${lerp(226, 255, t)}, ${lerp(232, 255, t)}, ${lerp(240, 255, t)}, ${lerp(0.7, 0.14, t)})`;
  
  const inputBg = `rgba(${lerp(241, 255, t)}, ${lerp(245, 255, t)}, ${lerp(249, 255, t)}, ${lerp(0.88, 0.08, t)})`;
  const inputBorder = `rgba(${lerp(203, 255, t)}, ${lerp(213, 255, t)}, ${lerp(225, 255, t)}, ${lerp(0.75, 0.15, t)})`;
  const inputText = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  const iconColor = `rgb(${lerp(100, 148, t)}, ${lerp(116, 163, t)}, ${lerp(139, 184, t)})`;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url('/login_bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden',
      padding: '32px 24px'
    }}>
      {/* Subtle Navy / Dark Blue Overlay for High Readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.78) 0%, rgba(30, 58, 138, 0.65) 50%, rgba(15, 23, 42, 0.82) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Main Responsive Two-Column Grid */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '48px',
        alignItems: 'center',
        margin: '0 auto'
      }} className="login-grid-container">

        {/* ================= LEFT SIDE (URS Logo, Large Paperless Campus, 4 Feature Labels) ================= */}
        <div style={{
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '32px',
          color: '#FFFFFF'
        }} className="login-left-section">
          
          {/* URS Logo & Header */}
          <div>
            <Image
              src="/urs_logo.png"
              alt="University of Rizal System Logo"
              width={72}
              height={90}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              priority
            />
          </div>

          {/* Large Bold Paperless Campus Heading */}
          <div>
            <h1 style={{
              fontSize: '54px',
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: '1.05',
              margin: 0,
              fontFamily: 'var(--font-heading)',
              textShadow: '0 2px 10px rgba(0,0,0,0.4)'
            }}>
              Paperless Campus
            </h1>
          </div>

          {/* Four Clean, Clearly Separated Bold Feature Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            width: '100%',
            maxWidth: '680px'
          }}>
            {/* 1. Event Management */}
            <div style={{
              background: 'rgba(37, 99, 235, 0.32)',
              border: '1.5px solid #3B82F6',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.38)',
              borderRadius: '14px',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#FFFFFF' }}>
                <IconCalendar />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.3' }}>
                Event Management
              </span>
            </div>

            {/* 2. E-Certificates */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '14px',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <IconCertificate />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.3' }}>
                E-Certificates
              </span>
            </div>

            {/* 3. Attendance Tracking */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '14px',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <IconAttendance />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.3' }}>
                Attendance Tracking
              </span>
            </div>

            {/* 4. Event Approvals */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '14px',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <IconApproval />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.3' }}>
                Event Approvals
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE (Clean Glassmorphism Login Card) ================= */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              background: cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '24px',
              boxShadow: cardShadow,
              padding: '40px 36px 32px',
              boxSizing: 'border-box',
              transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {/* Top-Right Light/Dark Mode Draggable Slider */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 20
            }}>
              <ThemeSlider
                progress={themeProgress}
                onProgressChange={setThemeProgress}
                onSnap={handleSnapTheme}
              />
            </div>

            {/* Card Header: Welcome Back Title & Subtitle */}
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{
                fontSize: '26px',
                fontWeight: '800',
                color: textTitle,
                margin: '0 0 10px 0',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em'
              }}>
                Welcome Back
              </h2>

              <p style={{
                fontSize: '13.5px',
                color: textSubtitle,
                lineHeight: '1.55',
                margin: 0
              }}>
                Sign in with your <strong style={{ color: textStrong, fontWeight: '700' }}>Student ID</strong> (for students) or{' '}
                <strong style={{ color: textStrong, fontWeight: '700' }}>Campus Email</strong> (for officers & administration).
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#EF4444',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '18px',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Student ID or Email input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: textSubtitle,
                  marginBottom: '6px'
                }}>
                  Student ID or Campus Email
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <IconUser color={iconColor} />
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. C2024-00179 or user@urs.edu.ph"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: inputText,
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password input with eye toggle */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: textSubtitle,
                  marginBottom: '6px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <IconLock color={iconColor} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 42px',
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: inputText,
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <IconEyeOff color={iconColor} /> : <IconEye color={iconColor} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '13px',
                  background: loading ? '#93C5FD' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Accounts Toggle & Dropdown */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.6px',
                  color: textSubtitle,
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.85
                }}
              >
                <span>Demo Accounts</span>
                <span style={{ fontSize: '10px', transform: showDemoAccounts ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
              </button>

              {showDemoAccounts && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '10px',
                  textAlign: 'left'
                }}>
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleDemoSelect(u)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase' }}>
                        {u.role.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: inputText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '9.5px', color: iconColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.studentNumber || u.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 960px) {
          .login-grid-container {
            grid-template-columns: 1.15fr 0.85fr !important;
          }
          .login-left-section {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
