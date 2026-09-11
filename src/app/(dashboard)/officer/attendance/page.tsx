'use client';

import React, { useState, useEffect } from 'react';
import { getAttendanceLogs, formatClassDisplay } from '@/lib/dataService';
import { AttendanceRecord } from '@/types';
import { formatManilaDateTime } from '@/lib/timezone';

export default function OfficerAttendanceLogsPage() {
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLogs() {
      const data = await getAttendanceLogs();
      setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.studentName.toLowerCase().includes(search.toLowerCase()) ||
      l.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (l.eventTitle && l.eventTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          Scanned Attendance Audit Trail
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Verified attendance records captured via authorized Officer QR Code scanning.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by student name, ID, or event title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>Loading attendance records...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Attendee Name</th>
                <th>Student ID</th>
                <th>Class Designation</th>
                <th>Event Title</th>
                <th>Check-in Timestamp (PST)</th>
                <th>Scanned By Officer</th>
                <th>Verification Mode</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No scanned attendance logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700', color: '#0F172A' }}>{log.studentName}</td>
                    <td style={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: '600' }}>
                      {log.studentNumber}
                    </td>
                    <td>
                      <span className="badge badge-student" style={{ fontWeight: '700' }}>
                        {formatClassDisplay(
                          log.course || log.department || 'BSIT',
                          log.yearLevel || log.yearSection || '1st Year',
                          log.section || log.yearSection || 'D'
                        )}
                      </span>
                    </td>
                    <td style={{ color: '#334155' }}>{log.eventTitle || 'Campus Event'}</td>
                    <td style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                      {formatManilaDateTime(log.checkInTime)}
                    </td>
                    <td>
                      <span className="badge badge-officer">{log.scannedByOfficerName}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {log.remarks || 'Verified Pass QR'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
