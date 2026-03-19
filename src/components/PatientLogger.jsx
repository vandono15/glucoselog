import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle, LogOut, Mail } from 'lucide-react';

const PatientLoggerApp = () => {
  const [view, setView] = useState('login'); // 'login' | 'logging' | 'forgot-code'
  const [patientCode, setPatientCode] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Form state
  const [timeOfDay, setTimeOfDay] = useState('am'); // 'am' | 'pm'
  const [rbs, setRbs] = useState('');
  const [nDose, setNDose] = useState('');
  const [rDose, setRDose] = useState('');
  const [carbs, setCarbs] = useState('');
  const [notes, setNotes] = useState('');
  const [hypoglycemiaFlag, setHypoglycemiaFlag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved code on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('glucoselog_patient_code');
    if (savedCode) {
      setPatientCode(savedCode);
      setRememberMe(true);
    }
  }, []);

  // Mock Supabase auth & data fetch
  // In production, replace with actual Supabase client
  const mockAuthPatient = async (code) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code.length >= 4) {
          resolve({
            patientId: `patient_${code}`,
            patientName: 'Sample Patient', // Replace with actual from DB
          });
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  const mockFetchEntries = async (id) => {
    // Simulate fetching patient entries from Supabase
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            timeOfDay: 'am',
            rbs: 156,
            nDose: 12,
            rDose: 8,
            carbs: 60,
            notes: 'Breakfast included toast',
            hypoglycemia: false,
            createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
          {
            id: 2,
            timeOfDay: 'pm',
            rbs: 198,
            nDose: 12,
            rDose: 10,
            carbs: 75,
            notes: '',
            hypoglycemia: false,
            createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
        ]);
      }, 500);
    });
  };

  const mockSubmitEntry = async (data) => {
    // Simulate saving to Supabase
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: Math.random(),
          ...data,
          createdAt: new Date().toISOString(),
        });
      }, 800);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientCode.trim()) {
      setErrorMessage('Please enter your patient code.');
      return;
    }

    const auth = await mockAuthPatient(patientCode.toUpperCase());
    if (auth) {
      setPatientId(auth.patientId);
      setPatientName(auth.patientName);
      setLoadingEntries(true);
      const entries = await mockFetchEntries(auth.patientId);
      setEntries(entries);
      setLoadingEntries(false);

      // Save code to device if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('glucoselog_patient_code', patientCode.toUpperCase());
      } else {
        localStorage.removeItem('glucoselog_patient_code');
      }

      setView('logging');
    } else {
      setErrorMessage('Invalid patient code. Please check and try again.');
    }
  };

  const handleForgotCode = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    // Mock email send
    if (forgotEmail) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setForgotMessage(
        `✓ Check your email at ${forgotEmail}. Your doctor will send your code shortly.`
      );
      setTimeout(() => {
        setView('login');
        setForgotEmail('');
        setForgotMessage('');
      }, 3000);
    }
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!rbs || !nDose || !rDose) {
      setErrorMessage('Please fill in RBS, N dose, and R dose.');
      return;
    }

    setSubmitting(true);
    const entry = {
      patientId,
      timeOfDay,
      rbs: parseFloat(rbs),
      nDose: parseFloat(nDose),
      rDose: parseFloat(rDose),
      carbs: carbs ? parseFloat(carbs) : null,
      notes,
      hypoglycemia: hypoglycemiaFlag,
    };

    const result = await mockSubmitEntry(entry);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage(`✓ ${timeOfDay.toUpperCase()} entry logged successfully`);
      setEntries([result, ...entries]);
      // Reset form
      setRbs('');
      setNDose('');
      setRDose('');
      setCarbs('');
      setNotes('');
      setHypoglycemiaFlag(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    setPatientId(null);
    setPatientName('');
    setPatientCode('');
    setEntries([]);
    setRememberMe(false);
    localStorage.removeItem('glucoselog_patient_code');
    setView('login');
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ===== RENDER: LOGIN =====
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-600">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">GlucoseLog</h1>
            <p className="text-slate-600 mb-6 text-sm">Paediatric Endocrinology Patient Tracker</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Patient Code
                </label>
                <input
                  type="text"
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                  placeholder="e.g., AX7K92"
                  maxLength="10"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-lg font-semibold tracking-wide"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Your doctor gave you this code. It looks like: AX7K or M2VQ9
                </p>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-700">
                  Remember me on this device
                </label>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-lg"
              >
                Sign In
              </button>

              {/* Forgot Code Link */}
              <button
                type="button"
                onClick={() => setView('forgot-code')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lost your code?
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-700">
                <strong>Demo:</strong> Use any code like AX7K or DEMO01 to test the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: FORGOT CODE =====
  if (view === 'forgot-code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-amber-600">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Your Code?</h1>
            <p className="text-slate-600 mb-6 text-sm">
              Enter your email and your doctor will send you a new code.
            </p>

            <form onSubmit={handleForgotCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="parent@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Your parent's or guardian's email
                </p>
              </div>

              {forgotMessage && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{forgotMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Send Code to Email
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-sm text-slate-600 hover:text-slate-700 font-medium py-2"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: LOGGING VIEW =====
  if (view === 'logging') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">GlucoseLog</h1>
              <p className="text-sm text-slate-600">Welcome, {patientName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Logging Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Log Your Reading</h2>

            <form onSubmit={handleSubmitEntry} className="space-y-5">
              {/* Time of Day */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  When?
                </label>
                <div className="flex gap-3">
                  {['am', 'pm'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setTimeOfDay(time)}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        timeOfDay === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {time.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* RBS */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  RBS (mg/dL)
                </label>
                <input
                  type="number"
                  value={rbs}
                  onChange={(e) => setRbs(e.target.value)}
                  placeholder="e.g., 156"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Insulin Doses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    N Dose (units)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={nDose}
                    onChange={(e) => setNDose(e.target.value)}
                    placeholder="e.g., 12"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    R Dose (units)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={rDose}
                    onChange={(e) => setRDose(e.target.value)}
                    placeholder="e.g., 8"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Carbs (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Carbs (g) — Optional
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="e.g., 60"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1">Skip if you're not sure</p>
              </div>

              {/* Hypoglycemia Flag */}
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <input
                  type="checkbox"
                  id="hypo"
                  checked={hypoglycemiaFlag}
                  onChange={(e) => setHypoglycemiaFlag(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="hypo" className="text-sm font-medium text-orange-900">
                  I had hypoglycemic symptoms (sweating, shaking, confusion)
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Had pizza, felt unwell"
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Saving...' : 'Log Entry'}
              </button>
            </form>
          </div>

          {/* Recent Entries */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-slate-300">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Entries</h2>

            {loadingEntries ? (
              <p className="text-slate-600">Loading...</p>
            ) : entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${
                      entry.hypoglycemia
                        ? 'bg-orange-50 border-orange-300'
                        : entry.rbs > 250
                        ? 'bg-red-50 border-red-200'
                        : entry.rbs < 100
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded">
                          {entry.timeOfDay.toUpperCase()}
                        </span>
                        <span className="text-sm text-slate-600">{formatDate(entry.createdAt)}</span>
                      </div>
                      {entry.hypoglycemia && (
                        <span className="text-xs font-bold bg-orange-200 text-orange-900 px-2 py-1 rounded">
                          HYPO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">RBS:</span>{' '}
                        <span className="font-bold text-slate-900">{entry.rbs}</span> mg/dL
                      </div>
                      <div>
                        <span className="text-slate-600">N / R:</span>{' '}
                        <span className="font-bold text-slate-900">
                          {entry.nDose} / {entry.rDose}
                        </span>{' '}
                        units
                      </div>
                      {entry.carbs && (
                        <div>
                          <span className="text-slate-600">Carbs:</span>{' '}
                          <span className="font-bold text-slate-900">{entry.carbs}</span>g
                        </div>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-slate-700 italic">"{entry.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm">No entries yet. Log your first reading above.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default PatientLoggerApp;
