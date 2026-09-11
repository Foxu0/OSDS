'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getEvents, getEventRegistrationStatus } from '@/lib/dataService';
import { CampusEvent } from '@/types';
import { formatManilaDate, formatManilaTime } from '@/lib/timezone';

export default function PublicCampusHomePage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUpcomingEvents() {
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    }
    loadUpcomingEvents();
  }, []);

  const userRole = (session?.user as any)?.role;

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Deep Navy Top Branding Bar */}
      <header style={{
        background: '#0F172A',
        color: '#FFFFFF',
        borderBottom: '3px solid #F59E0B',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo & University Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              URS
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>
                University of Rizal System
              </h1>
              <p style={{ color: '#FBBF24', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Cainta Campus • Public Event & Recognition Portal
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/verify/code" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              🔍 Verify E-Certificate
            </Link>

            {session?.user ? (
              <Link
                href={userRole === 'ADMIN' ? '/admin' : '/officer'}
                className="btn btn-gold"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Go to {userRole} Dashboard →
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                Staff & Officer Login →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        padding: '48px 24px 64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '9999px',
            color: '#FDE68A',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            🏛️ Official Campus Activities • No Account Required for Attendees
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.2 }}>
            Paperless Campus Events & E-Certificate System
          </h2>

          <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 28px auto' }}>
            Students, faculty, and visitors can browse upcoming campus events, register publicly with zero hassle, generate personal attendance QR passes, and verify official e-certificates.
          </p>

          {/* Quick Search */}
          <div style={{ maxWidth: '540px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search upcoming events by title, venue, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                padding: '14px 20px',
                borderRadius: '9999px',
                fontSize: '15px',
                border: '2px solid rgba(255,255,255,0.2)',
                background: '#FFFFFF',
                color: '#0F172A',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area: Prominently Displays Upcoming Events */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '-32px auto 0 auto', width: '100%', padding: '0 24px 64px 24px' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
              📅 Upcoming Campus Events
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Select an event card to view full details and complete public registration.
            </p>
          </div>

          <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '6px 14px', borderRadius: '9999px' }}>
            {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Available
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid #E2E8F0',
              borderTopColor: '#2563EB',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p>Loading upcoming campus activities...</p>
            <style jsx>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px' }}>No events found</h3>
            <p style={{ fontSize: '14px' }}>Try searching with different keywords or check back later for upcoming campus events.</p>
          </div>
        ) : (
          /* Upcoming Event Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredEvents.map((evt) => {
              const regStatus = getEventRegistrationStatus(evt);
              const isOpen = regStatus.canRegister;

              return (
                <div
                  key={evt.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderTop: `4px solid ${
                      regStatus.status === 'OPEN FOR REGISTRATION'
                        ? '#10B981'
                        : regStatus.status === 'REGISTRATION NOT YET OPEN'
                        ? '#F59E0B'
                        : '#DC2626'
                    }`
                  }}
                >
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Top Meta: Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                      <span className={`badge ${regStatus.badgeClass}`}>
                        {regStatus.label}
                      </span>

                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                        {evt.status}
                      </span>
                    </div>

                    {/* Event Title */}
                    <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', lineHeight: 1.3 }}>
                      {evt.title}
                    </h3>

                    {/* Description */}
                    <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>
                      {evt.description}
                    </p>

                    {/* Schedule & Venue Details */}
                    <div style={{
                      background: '#F8FAFC',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '20px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E293B' }}>
                        <span>📍</span>
                        <span style={{ fontWeight: '600' }}>Venue:</span>
                        <span style={{ color: '#1E40AF', fontWeight: '600' }}>{evt.venue}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E293B' }}>
                        <span>📅</span>
                        <span style={{ fontWeight: '600' }}>Event Date:</span>
                        <span style={{ color: '#475569' }}>{formatManilaDate(evt.startDate)}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E293B' }}>
                        <span>⏰</span>
                        <span style={{ fontWeight: '600' }}>Event Time:</span>
                        <span style={{ color: '#475569' }}>
                          {formatManilaTime(evt.startDate)} – {formatManilaTime(evt.endDate)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E293B', paddingTop: '6px', borderTop: '1px dashed #E2E8F0', fontSize: '12px' }}>
                        <span>⏳</span>
                        <span style={{ fontWeight: '600', color: '#475569' }}>Reg Window:</span>
                        <span style={{ color: regStatus.canRegister ? '#059669' : '#64748B' }}>
                          {formatManilaTime(regStatus.opensAt.toISOString())} – {formatManilaTime(regStatus.closesAt.toISOString())}
                        </span>
                      </div>
                    </div>

                    {/* Action Button to Complete Public Event Details */}
                    <Link
                      href={`/events/${evt.id}`}
                      className={`btn ${isOpen ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '100%', padding: '12px', textAlign: 'center' }}
                    >
                      {isOpen ? 'Register for Event →' : 'View Event Details →'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* University Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '32px 24px',
        textAlign: 'center',
        color: '#64748B',
        fontSize: '13px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>
            University of Rizal System – Cainta Campus
          </p>
          <p style={{ marginBottom: '16px' }}>
            Paperless Campus Event Management, QR Attendance, & Automated E-Certificate System
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px' }}>
            <Link href="/verify/code">E-Certificate Verification</Link>
            <span>•</span>
            <Link href="/login">Staff & Facilitator Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
