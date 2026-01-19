import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Races from './pages/Races';
import Training from './pages/Training';
import Settings from './pages/Settings';
import { AppData, TrainingRecord, SpeedTestItem } from './types';
import { getAppData, saveAppData } from './services/storage';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    // Load data on mount
    const loaded = getAppData();
    setData(loaded);
  }, []);

  const updateData = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  const handleSaveTraining = (record: TrainingRecord) => {
    if (!data) return;
    const updated = {
      ...data,
      training: [record, ...data.training]
    };
    updateData(updated);
  };

  const handleDeleteTraining = (id: string) => {
    if (!data) return;
    const updated = {
      ...data,
      training: data.training.filter(t => t.id !== id)
    };
    updateData(updated);
  };

  const handleUpdateItems = (items: SpeedTestItem[]) => {
    if (!data) return;
    updateData({ ...data, items });
  };

  const handleImportData = (imported: Partial<AppData>) => {
    if (!data) return;
    updateData({ ...data, ...imported });
  };

  if (!data) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard data={data} />} />
          <Route path="/races" element={<Races data={data} />} />
          <Route 
            path="/training" 
            element={
              <Training 
                data={data} 
                onSave={handleSaveTraining} 
                onDelete={handleDeleteTraining}
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                data={data} 
                onUpdateItems={handleUpdateItems}
                onImportData={handleImportData}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;