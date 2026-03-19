import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AlertCircle, Download, LogOut, Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react';

const DoctorDashboard = () => {
  const [view, setView] = useState('login'); // 'login' | 'dashboard'
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Mock doctor auth
  const mockAuthDoctor = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password && email.includes('@')) {
          resolve({ doctorId: 'doc_123', doctorName: 'Dr. Shah' });
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  // Mock fetch all patients for this doctor
  const mockFetchPatients = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            patientId: 'patient_001',
            name: 'Aisha M.',
            age: 10,
            regimen: 'NPH/Regular BID',
            lastEntry: new Date(Date.now() - 3 * 3600000).toISOString(),
            lastRBS: 156,
            alertCount: 2,
            alerts: ['High RBS yesterday', 'Missed PM dose'],
          },
          {
            patientId: 'patient_002',
            name: 'Jordan T.',
            age: 14,
            regimen: 'NPH/Regular BID',
            lastEntry: new Date(Date.now() - 48 * 3600000).toISOString(),
            lastRBS: 89,
            alertCount: 1,
            alerts: ['Low RBS - borderline hypoglycemia'],
          },
          {
            patientId: 'patient_003',
            name: 'Priya S.',
            age: 12,
            regimen: 'NPH/Regular BID',
            lastEntry: new Date(Date.now() - 12 * 3600000).toISOString(),
            lastRBS: 145,
            alertCount: 0,
            alerts: [],
          },
        ]);
      }, 600);
    });
  };

  // Mock fetch detailed patient data
  const mockFetchPatientDetails = async (patientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock 7-day trend data
        const trendData = [];
        const now = Date.now();
        for (let i = 6; i >= 0; i--) {
          const dayOffset = i * 24 * 3600000;
          trendData.push({
            date: new Date(now - dayOffset).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amRBS: 120 + Math.random() * 80,
            pmRBS: 140 + Math.random() * 100,
            amN: 11 + Math.random() * 3,
            amR: 7 + Math.random() * 4,
            pmN: 12 + Math.random() * 3,
            pmR: 8 + Math.random() * 4,
          });
        }

        // Calculate stats
        const allRBS = trendData.flatMap((d) => [d.amRBS, d.pmRBS]);
        const avgRBS = Math.round(allRBS.reduce((a, b) => a + b, 0) / allRBS.length);
        const minRBS = Math.round(Math.min(...allRBS));
        const maxRBS = Math.round(Math.max(...allRBS));
        const inRange = allRBS.filter((r) => r >= 100 && r <= 180).length;
        const timeInRange = Math.round((inRange / allRBS.length) * 100);

        resolve({
          patientId,
          name: 'Aisha M.',
          age: 10,
          regimen: 'NPH/Regular BID',
          parentContact: '+1 234 567 8900',
          diagnosisDate: '2022-03-15',
          trendData,
          stats: {
            avgRBS,
            minRBS,
            maxRBS,
            timeInRange,
            totalEntries: allRBS.length,
            hypoEvents: 2,
          },
          recentAlerts: [
            { id: 1, severity: 'high', message: 'RBS 298 at 2:00 PM - above target', timestamp: new Date(now - 24 * 3600000) },
            { id: 2, severity: 'medium', message: 'Missed PM dose yesterday', timestamp: new Date(now - 36 * 3600000) },
          ],
        });
      }, 800);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const auth = await mockAuthDoctor(doctorEmail, doctorPassword);
    if (auth) {
      const patientsList = await mockFetchPatients();
      setPatients(patientsList);
      setView('dashboard');
    } else {
      setErrorMessage('Invalid credentials. Try: any@email.com / password');
    }
  };

  const handleSelectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setLoadingPatient(true);
    const details = await mockFetchPatientDetails(patientId);
    setSelectedPatientData(details);
    setLoadingPatient(false);
  };

  const handleLogout = () => {
    setView('login');
    setDoctorEmail('');
    setDoctorPassword('');
    setPatients([]);
    setSelectedPatientId(null);
    setSelectedPatientData(null);
  };

  const handleExport = () => {
    if (!selectedPatientData) return;
    const csv = generateCSV(selectedPatientData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPatientData.name}_glucose_report.csv`;
    a.click();
  };

  const generateCSV = (data) => {
    const headers = ['Date', 'Time', 'RBS (mg/dL)', 'N Dose', 'R Dose', 'Carbs (g)'];
    const rows = data.trendData.map((d) => [
      d.date,
      'AM',
      Math.round(d.amRBS),
      d.amN.toFixed(1),
      d.amR.toFixed(1),
      '—',
    ]);
    data.trendData.forEach((d) => {
      rows.push([d.date, 'PM', Math.round(d.pmRBS), d.pmN.toFixed(1), d.pmR.toFixed(1), '—']);
    });
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const formatDate = (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ===== RENDER: LOGIN =====
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-indigo-600">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">GlucoseLog</h1>
            <p className="text-slate-600 mb-6 text-sm font-medium">Physician Dashboard</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  placeholder="dr.shah@clinic.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={doctorPassword}
                  onChange={(e) => setDoctorPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs text-slate-700">
                <strong>Demo:</strong> Use any@email.com / any password
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: DASHBOARD =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">GlucoseLog</h1>
            <p className="text-slate-600 text-sm">Physician Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-600 lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Your Patients</h2>
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.patientId}
                  onClick={() => handleSelectPatient(patient.patientId)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedPatientId === patient.patientId
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-600">Age {patient.age}</p>
                    </div>
                    {patient.alertCount > 0 && (
                      <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                        {patient.alertCount}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Latest: {Math.round(patient.lastRBS)} mg/dL
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Detail View */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPatientId && loadingPatient ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-slate-600">Loading patient data...</p>
              </div>
            ) : selectedPatientData ? (
              <>
                {/* Patient Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-600">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedPatientData.name}</h2>
                      <p className="text-slate-600 text-sm">
                        {selectedPatientData.age} years old • {selectedPatientData.regimen}
                      </p>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Avg RBS</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedPatientData.stats.avgRBS}
                      </p>
                      <p className="text-xs text-slate-500">mg/dL (7d)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Time in Range</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedPatientData.stats.timeInRange}%
                      </p>
                      <p className="text-xs text-slate-500">(100–180 mg/dL)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Range</p>
                      <p className="text-xl font-bold text-slate-900">
                        {selectedPatientData.stats.minRBS}–{selectedPatientData.stats.maxRBS}
                      </p>
                      <p className="text-xs text-slate-500">mg/dL (7d)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">Hypo Events</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {selectedPatientData.stats.hypoEvents}
                      </p>
                      <p className="text-xs text-slate-500">7 days</p>
                    </div>
                  </div>
                </div>

                {/* Glucose Trend Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-slate-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">7-Day Glucose Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedPatientData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[70, 300]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amRBS"
                        stroke="#6366f1"
                        name="AM RBS"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="pmRBS"
                        stroke="#f59e0b"
                        name="PM RBS"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Insulin Doses Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-slate-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Insulin Doses (7d Avg)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={selectedPatientData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amN" fill="#6366f1" name="AM N (units)" />
                      <Bar dataKey="amR" fill="#a78bfa" name="AM R (units)" />
                      <Bar dataKey="pmN" fill="#f59e0b" name="PM N (units)" />
                      <Bar dataKey="pmR" fill="#fbbf24" name="PM R (units)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Alerts */}
                {selectedPatientData.recentAlerts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Alerts</h3>
                    <div className="space-y-3">
                      {selectedPatientData.recentAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            alert.severity === 'high'
                              ? 'bg-red-50 border-red-500'
                              : 'bg-yellow-50 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                              }`}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{alert.message}</p>
                              <p className="text-xs text-slate-600">{formatDate(alert.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center border-l-4 border-slate-300">
                <p className="text-slate-600">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;