'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '@/lib/demoUsers';
import {
  ALLOWED_COURSES,
  ALLOWED_YEAR_LEVELS,
  COURSE_SECTION_MAP,
  getAutoYearSection,
  getYearSectionOptionsForCourse,
  formatClassDisplay,
  AllowedCourse,
  AllowedYearLevel,
} from '@/lib/studentRules';

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

const IconMail = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// --- Mathematical LERP Interpolation Helper ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// --- Compact Draggable Horizontal Light/Dark Slider Component ---
interface ThemeSliderProps {
  progress: number;
  onProgressChange: (p: number) => void;
  onSnap: (target: number) => void;
}

const ThemeSlider: React.FC<ThemeSliderProps> = ({ progress, onProgressChange, onSnap }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startProgressRef = useRef(0);
  const totalTravel = 34;

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
      onSnap(progress > 0.5 ? 0 : 1);
    } else {
      onSnap(progress >= 0.5 ? 1 : 0);
    }
  };

  const handlePointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onSnap(progress >= 0.5 ? 1 : 0);
  };

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
        zIndex: 20,
      }}
    >
      <div style={{
        position: 'absolute',
        left: '6px',
        top: '50%',
        transform: `translateY(-50%) scale(${lerp(1.1, 0.85, progress)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <IconSun opacity={sunOpacity} color={progress < 0.5 ? '#F59E0B' : '#94A3B8'} />
      </div>

      <div style={{
        position: 'absolute',
        right: '6px',
        top: '50%',
        transform: `translateY(-50%) scale(${lerp(0.85, 1.1, progress)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <IconMoon opacity={moonOpacity} color={progress > 0.5 ? '#93C5FD' : '#94A3B8'} />
      </div>

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
          willChange: 'left',
        }}
      />
    </div>
  );
};
// --- Accessible Theme-Adaptive Custom Select Dropdown Component ---
interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  id?: string;
  label: string;
  value: string;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (val: string) => void;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  textSubtitle: string;
  dropdownBg: string;
  dropdownBorder: string;
  dropdownShadow: string;
  optionHoverBg: string;
  optionSelectedBg: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  label,
  value,
  options,
  placeholder = '-- Select --',
  disabled = false,
  onChange,
  inputBg,
  inputBorder,
  inputText,
  textSubtitle,
  dropdownBg,
  dropdownBorder,
  dropdownShadow,
  optionHoverBg,
  optionSelectedBg,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: inputBg,
          border: `1px solid ${isOpen ? '#3B82F6' : inputBorder}`,
          borderRadius: '10px',
          fontSize: '13px',
          color: value ? inputText : textSubtitle,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: value ? '500' : '400',
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{
          fontSize: '10px',
          color: textSubtitle,
          marginLeft: '8px',
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease',
          display: 'flex',
          alignItems: 'center',
        }}>
          ▼
        </span>
      </div>

      {isOpen && !disabled && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: dropdownBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${dropdownBorder}`,
            borderRadius: '10px',
            boxShadow: dropdownShadow,
            maxHeight: '210px',
            overflowY: 'auto',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#3B82F6' : inputText,
                  background: isSelected ? optionSelectedBg : isFocused ? optionHoverBg : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.12s ease',
                }}
              >
                <span>{opt.label}</span>
                {opt.subLabel && (
                  <span style={{ fontSize: '11px', color: textSubtitle, marginLeft: '6px' }}>
                    {opt.subLabel}
                  </span>
                )}
                {isSelected && (
                  <span style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function LoginPage() {
  const currentYear = new Date().getFullYear();
  const dynamicPlaceholder = `C${currentYear}-00000`;

  // View Mode: 'login' | 'signup' | 'verify-otp' | 'forgot' | 'reset-otp'
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'verify-otp' | 'forgot' | 'reset-otp'>('login');

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const router = useRouter();

  // Load remembered identifier on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('paperless_remember_id');
      if (saved) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, []);

  // Sign Up Form State
  const [suName, setSuName] = useState('');
  const [suStudentNumber, setSuStudentNumber] = useState('');
  const [suCourse, setSuCourse] = useState<AllowedCourse | ''>('');
  const [suYearLevel, setSuYearLevel] = useState<AllowedYearLevel | ''>('1st Year');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirmPassword, setSuConfirmPassword] = useState('');
  const [showSuPassword, setShowSuPassword] = useState(false);

  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpStudentNumber, setOtpStudentNumber] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password / Reset State
  const [fpStudentNumber, setFpStudentNumber] = useState('');
  const [fpResetCode, setFpResetCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [showFpPassword, setShowFpPassword] = useState(false);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Course Change in Sign Up
  const handleCourseChange = (newCourse: AllowedCourse | '') => {
    setSuCourse(newCourse);
  };

  // --- Real-time Draggable Theme State ---
  const [themeProgress, setThemeProgress] = useState(1.0);
  const animFrameRef = useRef<number | null>(null);

  const handleSnapTheme = useCallback((target: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const start = themeProgress;
    const startTime = performance.now();
    const duration = 220;

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

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (rememberMe) {
      try {
        localStorage.setItem('paperless_remember_id', identifier.trim());
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.removeItem('paperless_remember_id');
      } catch {
        // Ignore
      }
    }

    try {
      const res = await signIn('credentials', {
        email: identifier.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.replace('/dashboard-redirect');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // 2. Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (suName.trim().length > 50) {
      setError('Full Name cannot exceed 50 characters.');
      return;
    }

    if (suStudentNumber.trim().length > 20) {
      setError('Student Number cannot exceed 20 characters.');
      return;
    }

    if (suEmail.trim().length > 50) {
      setError('Email cannot exceed 50 characters.');
      return;
    }

    if (suPassword !== suConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (suPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (suPassword.length > 30) {
      setError('Password cannot exceed 30 characters.');
      return;
    }

    if (suConfirmPassword.length > 30) {
      setError('Confirm Password cannot exceed 30 characters.');
      return;
    }

    if (!suCourse) {
      setError('Please select your Course/Program.');
      return;
    }

    if (!suYearLevel) {
      setError('Please select your Year Level.');
      return;
    }

    setLoading(true);

    const autoYearSec = getAutoYearSection(suCourse, suYearLevel);
    const section = COURSE_SECTION_MAP[suCourse] || 'D';

    try {
      const res = await fetch('/api/auth/student-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: suName,
          studentNumber: suStudentNumber,
          course: suCourse,
          yearLevel: suYearLevel,
          section,
          yearSection: autoYearSec,
          yearSectionCode: autoYearSec,
          email: suEmail,
          password: suPassword,
          confirmPassword: suConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      setOtpStudentNumber(data.studentNumber || suStudentNumber.trim().toUpperCase());
      setMaskedEmail(data.maskedEmail || suEmail);
      setResendCooldown(60);
      setViewMode('verify-otp');
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: otpStudentNumber,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Verification failed.');
        setLoading(false);
        return;
      }

      // Success! Transition back to Login with student number prefilled
      setIdentifier(data.studentNumber || otpStudentNumber);
      setPassword('');
      setViewMode('login');
      setSuccessMsg('Account activated successfully! Please sign in with your Student Number and password.');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend Code
  const handleResendCode = async (type: 'SIGNUP' | 'PASSWORD_RESET') => {
    if (resendCooldown > 0) return;
    setError('');
    const targetStudentNum = type === 'PASSWORD_RESET' ? fpStudentNumber : otpStudentNumber;

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: targetStudentNum,
          type,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setResendCooldown(60);
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  // 5. Handle Forgot Password Step 1 (Request Code)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: fpStudentNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Account not found.');
        setLoading(false);
        return;
      }

      setMaskedEmail(data.maskedEmail);
      setResendCooldown(60);
      setViewMode('reset-otp');
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Handle Forgot Password Step 2 (Reset with OTP)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (fpNewPassword !== fpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (fpNewPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: fpStudentNumber.trim(),
          code: fpResetCode.trim(),
          newPassword: fpNewPassword,
          confirmPassword: fpConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Password reset failed.');
        setLoading(false);
        return;
      }

      setIdentifier(data.studentNumber || fpStudentNumber);
      setPassword('');
      setViewMode('login');
      setSuccessMsg('Password reset successfully! Please sign in with your Student Number and new password.');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (user: typeof DEMO_USERS[0]) => {
    setIdentifier(user.studentNumber || user.email);
    setPassword(user.password);
    setError('');
    setSuccessMsg('');
  };

  // --- Interpolated Theme Tokens ---
  const t = themeProgress;
  const cardBg = `rgba(${lerp(255, 15, t)}, ${lerp(255, 23, t)}, ${lerp(255, 42, t)}, ${lerp(0.92, 0.65, t)})`;
  const cardBorder = `rgba(255, 255, 255, ${lerp(0.7, 0.18, t)})`;
  const cardShadow = `0 25px 50px rgba(0, 0, 0, ${lerp(0.18, 0.45, t)})`;
  const textTitle = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  const textSubtitle = `rgba(${lerp(71, 226, t)}, ${lerp(85, 232, t)}, ${lerp(105, 240, t)}, ${lerp(0.9, 0.82, t)})`;
  const textStrong = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  
  const inputBg = `rgba(${lerp(241, 255, t)}, ${lerp(245, 255, t)}, ${lerp(249, 255, t)}, ${lerp(0.88, 0.08, t)})`;
  const inputBorder = `rgba(${lerp(203, 255, t)}, ${lerp(213, 255, t)}, ${lerp(225, 255, t)}, ${lerp(0.75, 0.15, t)})`;
  const inputText = `rgb(${lerp(15, 255, t)}, ${lerp(23, 255, t)}, ${lerp(42, 255, t)})`;
  const iconColor = `rgb(${lerp(100, 148, t)}, ${lerp(116, 163, t)}, ${lerp(139, 184, t)})`;

  const dropdownBg = `rgba(${lerp(255, 18, t)}, ${lerp(255, 26, t)}, ${lerp(255, 46, t)}, 0.98)`;
  const dropdownBorder = `rgba(${lerp(203, 71, t)}, ${lerp(213, 85, t)}, ${lerp(225, 105, t)}, ${lerp(0.85, 0.45, t)})`;
  const dropdownShadow = `0 16px 36px rgba(0, 0, 0, ${lerp(0.18, 0.6, t)})`;
  const optionHoverBg = `rgba(59, 130, 246, ${lerp(0.12, 0.25, t)})`;
  const optionSelectedBg = `rgba(37, 99, 235, ${lerp(0.18, 0.38, t)})`;

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
      padding: '32px 24px',
    }}>
      {/* Dark Navy Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.78) 0%, rgba(30, 58, 138, 0.65) 50%, rgba(15, 23, 42, 0.82) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Main Grid */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '48px',
        alignItems: 'center',
        margin: '0 auto',
      }} className="login-grid-container">

        {/* ================= LEFT SIDE (URS Logo, Large Paperless Campus, 4 Feature Labels) ================= */}
        <div style={{
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '32px',
          color: '#FFFFFF',
        }} className="login-left-section">
          
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

          <div>
            <h1 style={{
              fontSize: '54px',
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: '1.05',
              margin: 0,
              fontFamily: 'var(--font-heading)',
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}>
              Paperless Campus
            </h1>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            width: '100%',
            maxWidth: '680px',
          }}>
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
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#FFFFFF' }}>
                <IconCalendar />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.3' }}>
                Event Management
              </span>
            </div>

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
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <IconCertificate />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.3' }}>
                E-Certificates
              </span>
            </div>

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
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <IconAttendance />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.3' }}>
                Attendance Tracking
              </span>
            </div>

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
              backdropFilter: 'blur(10px)',
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

        {/* ================= RIGHT SIDE (Glassmorphic Auth Card) ================= */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: viewMode === 'signup' ? '480px' : '440px',
              background: cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '24px',
              boxShadow: cardShadow,
              padding: viewMode === 'signup' ? '32px 30px' : '40px 36px 32px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Top-Right Slider */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 20,
            }}>
              <ThemeSlider
                progress={themeProgress}
                onProgressChange={setThemeProgress}
                onSnap={handleSnapTheme}
              />
            </div>

            {/* ================= VIEW 1: NORMAL SIGN IN ================= */}
            {viewMode === 'login' && (
              <>
                <div style={{ marginBottom: '20px', paddingRight: '64px' }}>
                  <h2 style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: textTitle,
                    margin: '0 0 10px 0',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                  }}>
                    Welcome, Giants
                  </h2>

                  <p style={{
                    fontSize: '13.5px',
                    color: textSubtitle,
                    lineHeight: '1.55',
                    margin: 0,
                  }}>
                    Sign in with your <strong style={{ color: textStrong, fontWeight: '700' }}>Student Number</strong> (for students) or{' '}
                    <strong style={{ color: textStrong, fontWeight: '700' }}>Campus Email</strong> (for staff).
                  </p>
                </div>

                {/* Notifications in normal form flow */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: textSubtitle,
                      marginBottom: '6px',
                    }}>
                      Student Number
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
                        pointerEvents: 'none',
                      }}>
                        <IconUser color={iconColor} />
                      </span>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={`e.g. ${dynamicPlaceholder}`}
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
                        }}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: textSubtitle,
                      marginBottom: '6px',
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
                        pointerEvents: 'none',
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
                          padding: '4px',
                        }}
                      >
                        {showPassword ? <IconEyeOff color={iconColor} /> : <IconEye color={iconColor} />}
                      </button>
                    </div>
                  </div>

                  {/* Row DIRECTLY BELOW Password input: [☐ Remember me] on Left & [Forgot Password?] on Right */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '-2px',
                    marginBottom: '2px',
                    width: '100%',
                  }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: textSubtitle,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#2563EB',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setFpStudentNumber(identifier);
                        setViewMode('forgot');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      Forgot Password?
                    </button>
                  </div>

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
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: textSubtitle }}>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setViewMode('signup');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3B82F6',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      fontFamily: 'inherit',
                    }}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Demo Accounts */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
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
                      opacity: 0.85,
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
                      textAlign: 'left',
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
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase' }}>
                            {u.role.replace('_', ' ')}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: inputText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '9.5px', color: iconColor }}>
                            {u.role === 'STUDENT' ? 'Student Account' : u.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= VIEW 2: STUDENT SIGN UP ================= */}
            {viewMode === 'signup' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '64px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: textSubtitle,
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconArrowLeft />
                  </button>
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: textTitle,
                    margin: 0,
                    fontFamily: 'var(--font-heading)',
                  }}>
                    Student Sign Up
                  </h2>
                </div>

                <p style={{ fontSize: '12.5px', color: textSubtitle, marginBottom: '14px', paddingRight: '20px' }}>
                  Create your Paperless Campus student account. Email verification is required before first sign-in.
                </p>

                {/* Notifications in normal form flow */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      placeholder="e.g. Juan C. Dela Cruz"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: inputText,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      Student Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={suStudentNumber}
                      onChange={(e) => setSuStudentNumber(e.target.value.toUpperCase())}
                      placeholder={`e.g. ${dynamicPlaceholder}`}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: inputText,
                        outline: 'none',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                        Course *
                      </label>
                      <CustomSelect
                        label="Course"
                        value={suCourse}
                        placeholder="-- Select Course --"
                        options={ALLOWED_COURSES.map((c) => ({ value: c, label: c }))}
                        onChange={(val) => handleCourseChange(val as AllowedCourse)}
                        inputBg={inputBg}
                        inputBorder={inputBorder}
                        inputText={inputText}
                        textSubtitle={textSubtitle}
                        dropdownBg={dropdownBg}
                        dropdownBorder={dropdownBorder}
                        dropdownShadow={dropdownShadow}
                        optionHoverBg={optionHoverBg}
                        optionSelectedBg={optionSelectedBg}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                        Year Level *
                      </label>
                      <CustomSelect
                        label="Year Level"
                        value={suYearLevel}
                        placeholder="-- Select Year --"
                        options={ALLOWED_YEAR_LEVELS.map((y) => ({ value: y, label: y }))}
                        onChange={(val) => setSuYearLevel(val as AllowedYearLevel)}
                        inputBg={inputBg}
                        inputBorder={inputBorder}
                        inputText={inputText}
                        textSubtitle={textSubtitle}
                        dropdownBg={dropdownBg}
                        dropdownBorder={dropdownBorder}
                        dropdownShadow={dropdownShadow}
                        optionHoverBg={optionHoverBg}
                        optionSelectedBg={optionSelectedBg}
                      />
                    </div>
                  </div>

                  {/* Automatic Year & Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      Year &amp; Section
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={getAutoYearSection(suCourse, suYearLevel)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: suCourse && suYearLevel ? inputText : textSubtitle,
                        fontWeight: suCourse && suYearLevel ? '700' : '400',
                        outline: 'none',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box',
                        opacity: 0.9,
                      }}
                    />
                  </div>

                  {suCourse && suYearLevel && (
                    <div style={{
                      background: 'rgba(37, 99, 235, 0.12)',
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: textSubtitle }}>Class Designation:</span>
                      <strong style={{ color: '#3B82F6', fontWeight: '700' }}>
                        {formatClassDisplay(suCourse, suYearLevel, COURSE_SECTION_MAP[suCourse])}
                      </strong>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      Campus Email / Gmail *
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={50}
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="e.g. juan@urs.edu.ph or student@gmail.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: inputText,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                        Password *
                      </label>
                      <input
                        type={showSuPassword ? 'text' : 'password'}
                        required
                        maxLength={30}
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        placeholder="Min. 6 chars"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: inputText,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                        Confirm Password *
                      </label>
                      <input
                        type={showSuPassword ? 'text' : 'password'}
                        required
                        maxLength={30}
                        value={suConfirmPassword}
                        onChange={(e) => setSuConfirmPassword(e.target.value)}
                        placeholder="Confirm"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: inputText,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      id="showPassSu"
                      checked={showSuPassword}
                      onChange={(e) => setShowSuPassword(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="showPassSu" style={{ fontSize: '12px', color: textSubtitle, cursor: 'pointer' }}>
                      Show Passwords
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px',
                      background: loading ? '#93C5FD' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Creating Account & Sending OTP...' : 'Sign Up & Verify Email →'}
                  </button>
                </form>
              </>
            )}

            {/* ================= VIEW 3: OTP VERIFICATION ================= */}
            {viewMode === 'verify-otp' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.15)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}>
                    <IconMail color="#3B82F6" />
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: textTitle, margin: '0 0 6px 0' }}>
                    Verify Your Email
                  </h2>
                  <p style={{ fontSize: '13px', color: textSubtitle, lineHeight: '1.5', margin: 0 }}>
                    Enter the 6-digit verification code sent to <strong style={{ color: textStrong }}>{maskedEmail}</strong>.
                  </p>
                </div>

                {/* Notifications in normal form flow */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '6px', textAlign: 'center' }}>
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: inputBg,
                        border: `2px solid #2563EB`,
                        borderRadius: '12px',
                        fontSize: '24px',
                        fontWeight: '800',
                        color: inputText,
                        outline: 'none',
                        letterSpacing: '8px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', margin: 0 }}>
                    ⏱️ Code expires in approximately 10 minutes.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: loading || otpCode.length < 6 ? '#93C5FD' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: loading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Activate Account & Sign In'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleResendCode('SIGNUP')}
                      disabled={resendCooldown > 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#94A3B8' : '#3B82F6',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        padding: 0,
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setViewMode('login');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: textSubtitle,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ================= VIEW 4: FORGOT PASSWORD STEP 1 ================= */}
            {viewMode === 'forgot' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingRight: '64px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: textSubtitle,
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconArrowLeft />
                  </button>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: textTitle, margin: 0 }}>
                    Forgot Password
                  </h2>
                </div>

                <p style={{ fontSize: '13px', color: textSubtitle, marginBottom: '16px', lineHeight: '1.5', paddingRight: '20px' }}>
                  Enter your <strong style={{ color: textStrong }}>Student Number</strong> to receive a secure password reset code at your registered email address.
                </p>

                {/* Notifications in normal form flow */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textSubtitle, marginBottom: '6px' }}>
                      Student Number
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
                        pointerEvents: 'none',
                      }}>
                        <IconUser color={iconColor} />
                      </span>
                      <input
                        type="text"
                        required
                        value={fpStudentNumber}
                        onChange={(e) => setFpStudentNumber(e.target.value.toUpperCase())}
                        placeholder={`e.g. ${dynamicPlaceholder}`}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: inputText,
                          outline: 'none',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !fpStudentNumber}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: loading ? '#93C5FD' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Searching Account...' : 'Continue →'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setViewMode('login');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ================= VIEW 5: FORGOT PASSWORD STEP 2 (RESET OTP & NEW PASS) ================= */}
            {viewMode === 'reset-otp' && (
              <>
                <div style={{ marginBottom: '14px', paddingRight: '64px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: textTitle, margin: '0 0 6px 0' }}>
                    Create New Password
                  </h2>
                  <p style={{ fontSize: '13px', color: textSubtitle, lineHeight: '1.5', margin: 0 }}>
                    Reset code sent to <strong style={{ color: textStrong }}>{maskedEmail}</strong>.
                  </p>
                </div>

                {/* Notifications in normal form flow */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#EF4444',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      6-Digit Reset Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={fpResetCode}
                      onChange={(e) => setFpResetCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '18px',
                        fontWeight: '800',
                        color: inputText,
                        outline: 'none',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      New Password *
                    </label>
                    <input
                      type={showFpPassword ? 'text' : 'password'}
                      required
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: inputText,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSubtitle, marginBottom: '4px' }}>
                      Confirm New Password *
                    </label>
                    <input
                      type={showFpPassword ? 'text' : 'password'}
                      required
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: inputText,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      id="showPassFp"
                      checked={showFpPassword}
                      onChange={(e) => setShowFpPassword(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="showPassFp" style={{ fontSize: '12px', color: textSubtitle, cursor: 'pointer' }}>
                      Show Passwords
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || fpResetCode.length < 6}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '12px',
                      background: loading || fpResetCode.length < 6 ? '#93C5FD' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: loading || fpResetCode.length < 6 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleResendCode('PASSWORD_RESET')}
                      disabled={resendCooldown > 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#94A3B8' : '#3B82F6',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        padding: 0,
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setViewMode('login');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: textSubtitle,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>

      <style>{`
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
