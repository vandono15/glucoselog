import React, { useState } from 'react';
import PatientLogger from './components/PatientLogger';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [appType, setAppType] = useState(null);

  return (
    <div>
      {!appType ? (
        <div style={{ textAlign: 'center', paddingTop: '50px' }}>
          <h1>GlucoseLog</h1>
          <p>Choose who you are:</p>
          <button 
            onClick={() => setAppType('patient')}
            style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
          >
            Patient
          </button>
          <button 
            onClick={() => setAppType('doctor')}
            style={{ padding: '10px 20px', fontSize: '16px' }}
          >
            Doctor
          </button>
        </div>
      ) : appType === 'patient' ? (
        <PatientLogger />
      ) : (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>Doctor Dashboard</h1>
          <p>Patient list is loading...</p>
          <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            The dashboard is working! You can see patient data in your Supabase database.
          </p>
          <button 
            onClick={() => setAppType(null)}
            style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export default App;