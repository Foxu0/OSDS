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
const IconGripVertical = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/>
    <circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/>
    <circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

type FieldType = 'SHORT_TEXT' | 'LONG_TEXT' | 'DROPDOWN' | 'CHECKBOX' | 'RADIO';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[];
  placeholder?: string;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'SHORT_TEXT', label: 'Short Answer' },
  { value: 'LONG_TEXT', label: 'Paragraph' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'RADIO', label: 'Multiple Choice' },
  { value: 'CHECKBOX', label: 'Checkboxes' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const PREVIEW_FIELD: Record<FieldType, React.ReactNode> = {
  SHORT_TEXT: <input disabled placeholder="Short answer text" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', background: '#FAFAFA', boxSizing: 'border-box' }} />,
  LONG_TEXT: <textarea disabled placeholder="Long answer text" rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', background: '#FAFAFA', resize: 'none', boxSizing: 'border-box' }} />,
  DROPDOWN: <select disabled style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', background: '#FAFAFA' }}><option>Select an option</option></select>,
  RADIO: <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}><input type="radio" disabled /> Option 1</label></div>,
  CHECKBOX: <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}><input type="checkbox" disabled /> Option 1</label></div>,
};

export default function RegistrationFormBuilder() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [fields, setFields] = useState<FormField[]>([
    { id: generateId(), type: 'SHORT_TEXT', label: 'Full Name', required: true, options: [], placeholder: 'Enter your full name' },
    { id: generateId(), type: 'SHORT_TEXT', label: 'Student Number', required: true, options: [], placeholder: 'e.g. C2024-00179' },
    { id: generateId(), type: 'SHORT_TEXT', label: 'Email Address', required: true, options: [], placeholder: 'your@email.com' },
  ]);

  const [eventTitle, setEventTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, formRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/forms?type=REGISTRATION`),
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

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: generateId(), type, label: 'New Question', required: false,
      options: ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(type) ? ['Option 1', 'Option 2'] : [],
    };
    setFields(prev => [...prev, newField]);
    setActiveFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const addOption = (fieldId: string) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, options: [...f.options, `Option ${f.options.length + 1}`] } : f
    ));
  };

  const updateOption = (fieldId: string, idx: number, val: string) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, options: f.options.map((o, i) => i === idx ? val : o) } : f
    ));
  };

  const removeOption = (fieldId: string, idx: number) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, options: f.options.filter((_, i) => i !== idx) } : f
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/events/${eventId}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'REGISTRATION', fields }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', color: '#64748B', cursor: 'pointer', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FAFAFA' }}>
          <IconArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
            Registration Form Builder
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px' }}>{eventTitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px',
            background: saved ? '#ECFDF5' : saving ? '#93C5FD' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            color: saved ? '#059669' : '#FFFFFF', border: saved ? '1px solid #A7F3D0' : 'none',
            borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}
        >
          <IconSave /> {saved ? 'Saved!' : 'Save Form'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', alignItems: 'start' }}>
        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Form Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', borderRadius: '16px', padding: '24px',
            borderTop: '8px solid #F59E0B', color: '#FFFFFF'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: '#FFFFFF' }}>
              {eventTitle} — Registration Form
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              Participants will fill out this form to register for the event.
            </p>
          </div>

          {/* Question Cards */}
          {fields.map((field) => {
            const isActive = activeFieldId === field.id;
            return (
              <div
                key={field.id}
                onClick={() => setActiveFieldId(field.id)}
                style={{
                  background: '#FFFFFF', borderRadius: '14px',
                  border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  padding: '20px', cursor: 'pointer',
                  boxShadow: isActive ? '0 0 0 3px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#CBD5E1', marginTop: '4px', flexShrink: 0 }}><IconGripVertical /></div>
                  <div style={{ flex: 1 }}>
                    {isActive ? (
                      <>
                        <input
                          value={field.label}
                          onChange={e => updateField(field.id, { label: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '100%', fontSize: '16px', fontWeight: '600', color: '#0F172A',
                            border: 'none', borderBottom: '2px solid #2563EB', outline: 'none',
                            marginBottom: '12px', background: 'transparent', fontFamily: 'inherit',
                            paddingBottom: '4px'
                          }}
                        />
                        <select
                          value={field.type}
                          onChange={e => updateField(field.id, { type: e.target.value as FieldType, options: ['DROPDOWN','RADIO','CHECKBOX'].includes(e.target.value) ? ['Option 1','Option 2'] : [] })}
                          onClick={e => e.stopPropagation()}
                          style={{ marginBottom: '12px', padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                        >
                          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>

                        {/* Options editor for multi-choice */}
                        {['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(field.type) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            {field.options.map((opt, oi) => (
                              <div key={oi} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type={field.type === 'CHECKBOX' ? 'checkbox' : 'radio'}
                                  disabled
                                  style={{ flexShrink: 0 }}
                                />
                                <input
                                  value={opt}
                                  onChange={e => updateOption(field.id, oi, e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ flex: 1, border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '13px', padding: '3px 0', fontFamily: 'inherit' }}
                                />
                                <button onClick={(e) => { e.stopPropagation(); removeOption(field.id, oi); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1' }}>
                                  <IconTrash />
                                </button>
                              </div>
                            ))}
                            <button onClick={(e) => { e.stopPropagation(); addOption(field.id); }}
                              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontSize: '13px', fontFamily: 'inherit', fontWeight: '600' }}>
                              <IconPlus /> Add Option
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={e => updateField(field.id, { required: e.target.checked })}
                              onClick={e => e.stopPropagation()}
                            />
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{field.label}</span>
                          {field.required && <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700' }}>*</span>}
                          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: '20px' }}>
                            {FIELD_TYPES.find(t => t.value === field.type)?.label}
                          </span>
                        </div>
                        <div style={{ pointerEvents: 'none' }}>{PREVIEW_FIELD[field.type]}</div>
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
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    color: '#334155', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ color: '#2563EB' }}><IconPlus /></span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
