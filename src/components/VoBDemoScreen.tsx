import React, { useState } from 'react';

interface Patient {
  id: number;
  name: string;
  dob: string;
  payer: string;
  status: 'Unknown' | 'Active' | 'Inactive' | 'Pending';
}

const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'John Doe', dob: '1980-01-01', payer: 'Aetna', status: 'Unknown' },
  { id: 2, name: 'Jane Smith', dob: '1992-05-15', payer: 'Blue Cross', status: 'Unknown' },
  { id: 3, name: 'Bob Johnson', dob: '1975-11-20', payer: 'UnitedHealthcare', status: 'Unknown' },
];

export function VoBDemoScreen() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [loading, setLoading] = useState<number | null>(null);

  const checkBenefits = async (id: number) => {
    setLoading(id);
    // Simulate API call
    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id === id) {
          // Randomly assign status for demo
          const statuses: Patient['status'][] = ['Active', 'Inactive', 'Pending'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...p, status: randomStatus };
        }
        return p;
      }));
      setLoading(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full p-8 gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#101828]">VoB Demo</h1>
        <p className="text-[#4a5565]">Real-time Verification of Benefits</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600">Patient Name</th>
              <th className="p-4 font-semibold text-sm text-gray-600">DOB</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Payer</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{patient.name}</td>
                <td className="p-4 text-gray-600">{patient.dob}</td>
                <td className="p-4 text-gray-600">{patient.payer}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'Active' ? 'bg-green-100 text-green-700' :
                    patient.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                    patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => checkBenefits(patient.id)}
                    disabled={loading === patient.id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      loading === patient.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading === patient.id ? 'Checking...' : 'Check Benefits'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
