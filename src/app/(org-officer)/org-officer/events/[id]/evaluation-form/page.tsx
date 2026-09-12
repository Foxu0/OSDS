'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconStar = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F59E0B' : 'none'} stroke={active ? '#F59E0B' : '#CBD5E1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

type EvalFieldType = 'RATING' | 'LONG_TEXT' | 'SHORT_TEXT' | 'RADIO';

interface EvalField {
  id: string;
  type: EvalFieldType;
  label: string;
  required: boolean;
  ratingScale?: number;
  options?: string[];
}

const FIELD_TYPES: { value: EvalFieldType; label: string; description: string }[] = [
  { value: 'RATING', label: 'Star Rating', description: '1–5 scale' },
  { value: 'LONG_TEXT', label: 'Open Feedback', description: 'Paragraph text' },
  { value: 'SHORT_TEXT', label: 'Short Answer', description: 'Single line' },
  { value: 'RADIO', label: 'Multiple Choice', description: 'Select one option' },
];

function generateId() { return Math.random().toString(36).slice(2, 10); }

const DEFAULT_FIELDS: EvalField[] = [
  { id: generateId(), type: 'RATING', label: 'Overall Event Organization', required: true, ratingScale: 5 },
  { id: generateId(), type: 'RATING', label: 'Quality of Content / Speakers', required: true, ratingScale: 5 },
  { id: generateId(), type: 'RATING', label: 'Venue and Facilities', required: true, ratingScale: 5 },
  { id: generateId(), type: 'RATING', label: 'Registration & Check-in Process', required: true, ratingScale: 5 },
  { id: generateId(), type: 'RATING', label: 'Would Recommend to Others', required: true, ratingScale: 5 },
  { id: generateId(), type: 'LONG_TEXT', label: 'Additional Comments or Suggestions', required: false },
];

export default function EvaluationFormBuilder() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [fields, setFields] = useState<EvalField[]>(DEFAULT_FIELDS);
  const [eventTitle, setEventTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, formRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/forms?type=EVALUATION`),
        ]);
        if (evRes.ok) { const ev = await evRes.json(); setEventTitle(ev.title || ''); }
        if (formRes.ok) {
          const data = await formRes.json();
          if (data.form?.fields?.length > 0) setFields(data.form.fields);
        }
      } catch (err) { console.error(err); }
    };
    load();
  }, [eventId]);

  const addField = (type: EvalFieldType) => {
    const f: EvalField = {
      id: generateId(), type,
      label: type === 'RATING' ? 'New Rating Question' : type === 'LONG_TEXT' ? 'Open Feedback' : 'New Question',
      required: type === 'RATING',
      ratingScale: type === 'RATING' ? 5 : undefined,
      options: type === 'RADIO' ? ['Strongly Agree', 'Agree', 'Neutral', 'Disagree'] : undefined,
    };
    setFields(prev => [...prev, f]);
    setActiveFieldId(f.id);
  };

  const updateField = (id: string, updates: Partial<EvalField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/events/${eventId}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'EVALUATION', fields }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const renderFieldPreview = (field: EvalField) => {
    if (field.type === 'RATING') {
      return (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          {[1, 2, 3, 4, 5].map(star => <IconStar key={star} />)}
          <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '6px', alignSelf: 'center' }}>1 = Poor, 5 = Excellent</span>
        </div>
      );
    }
    if (field.type === 'LONG_TEXT') {
      return <textarea disabled rows={2} placeholder="Participant's written response..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', background: '#FAFAFA', resize: 'none', boxSizing: 'border-box', marginTop: '8px' }} />;
    }
    if (field.type === 'SHORT_TEXT') {
      return <input disabled placeholder="Short answer..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', background: '#FAFAFA', boxSizing: 'border-box', marginTop: '8px' }} />;
    }
    if (field.type === 'RADIO') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          {(field.options || []).map((o, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
              <input type="radio" disabled /> {o}
            </label>
          ))}
        </div>
      );
    }
    return null;
  };

  const ratingCount = fields.filter(f => f.type === 'RATING').length;
  const textCount = fields.filter(f => f.type !== 'RATING').length;

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', color: '#64748B', cursor: 'pointer', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FAFAFA' }}>
          <IconArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
            Evaluation Form Builder
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px' }}>{eventTitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px',
            background: saved ? '#ECFDF5' : saving ? '#93C5FD' : 'linear-gradient(135deg, #D97706, #F59E0B)',
            color: saved ? '#059669' : '#FFFFFF', border: saved ? '1px solid #A7F3D0' : 'none',
            borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}
        >
          <IconSave /> {saved ? 'Saved!' : 'Save Form'}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Rating Questions', value: ratingCount, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Text Questions', value: textCount, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Total Questions', value: fields.length, color: '#475569', bg: '#F1F5F9' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '12px 16px', border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', alignItems: 'start' }}>
        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Form Header */}
          <div style={{
            background: 'linear-gradient(135deg, #D97706, #F59E0B)', borderRadius: '16px', padding: '22px',
            borderTop: '8px solid #1E3A8A', color: '#FFFFFF'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', color: '#FFFFFF' }}>
              {eventTitle} — Evaluation Form
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
              Your feedback helps us improve future events. All responses are confidential.
            </p>
          </div>

          {/* Questions */}
          {fields.map((field, idx) => {
            const isActive = activeFieldId === field.id;
            const typeInfo = FIELD_TYPES.find(t => t.value === field.type);
            return (
              <div
                key={field.id}
                onClick={() => setActiveFieldId(field.id)}
                style={{
                  background: '#FFFFFF', borderRadius: '14px',
                  border: isActive ? '2px solid #D97706' : '1px solid #E2E8F0',
                  padding: '20px', cursor: 'pointer',
                  boxShadow: isActive ? '0 0 0 3px rgba(217,119,6,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#94A3B8', width: '20px', flexShrink: 0, marginTop: '2px' }}>
                    {idx + 1}.
                  </div>
                  <div style={{ flex: 1 }}>
                    {isActive ? (
                      <>
                        <input
                          value={field.label}
                          onChange={e => updateField(field.id, { label: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '100%', fontSize: '15px', fontWeight: '600', color: '#0F172A',
                            border: 'none', borderBottom: '2px solid #D97706', outline: 'none',
                            marginBottom: '10px', background: 'transparent', fontFamily: 'inherit', paddingBottom: '4px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          {FIELD_TYPES.map(t => (
                            <button
                              key={t.value}
                              onClick={(e) => { e.stopPropagation(); updateField(field.id, { type: t.value, options: t.value === 'RADIO' ? ['Strongly Agree', 'Agree', 'Neutral', 'Disagree'] : undefined, ratingScale: t.value === 'RATING' ? 5 : undefined }); }}
                              style={{
                                padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit',
                                background: field.type === t.value ? '#D97706' : '#F1F5F9',
                                color: field.type === t.value ? '#FFFFFF' : '#475569',
                                border: 'none'
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {field.type === 'RADIO' && (
                          <div style={{ marginBottom: '10px' }}>
                            {(field.options || []).map((o, oi) => (
                              <div key={oi} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <input type="radio" disabled />
                                <input value={o} onChange={e => { const opts = [...(field.options || [])]; opts[oi] = e.target.value; updateField(field.id, { options: opts }); }} onClick={e => e.stopPropagation()}
                                  style={{ flex: 1, border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '13px', padding: '2px 0', fontFamily: 'inherit' }} />
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                            <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} onClick={e => e.stopPropagation()} />
                            Required
                          </label>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '7px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit' }}
                          >
                            <IconTrash /> Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{field.label}</span>
                          {field.required && <span style={{ color: '#DC2626', fontWeight: '700', fontSize: '12px' }}>*</span>}
                          <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#94A3B8', background: field.type === 'RATING' ? '#FFFBEB' : '#F1F5F9', padding: '2px 7px', borderRadius: '20px', fontWeight: '600' }}>
                            {typeInfo?.label}
                          </span>
                        </div>
                        <div style={{ pointerEvents: 'none' }}>{renderFieldPreview(field)}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Field Panel */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Add Question
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FIELD_TYPES.map(type => (
                <button key={type.value} onClick={() => addField(type.value)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                  borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  color: '#334155', textAlign: 'left', fontFamily: 'inherit'
                }}>
                  <span style={{ color: '#D97706' }}><IconPlus /></span>
                  <div>
                    <div>{type.label}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '400' }}>{type.description}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.5' }}>
                Click any question to edit it. Rating questions use a 1–5 star scale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
