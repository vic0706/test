import React, { useState, useRef, useEffect } from 'react';
import { AppData, SpeedTestItem, TrainingRecord } from '../types';
import { Plus, Save, Clock, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  data: AppData;
  onSave: (record: TrainingRecord) => void;
  onDelete: (id: string) => void;
}

const Training: React.FC<Props> = ({ data, onSave, onDelete }) => {
  const [selectedItem, setSelectedItem] = useState<string>(data.items[0]?.id || '');
  const [seconds, setSeconds] = useState<string>('');
  const [note, setNote] = useState('');
  const [sessionRecords, setSessionRecords] = useState<TrainingRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when item changes for rapid entry
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seconds || !selectedItem) return;

    const val = parseFloat(seconds);
    if (isNaN(val) || val <= 0 || val > 200) {
      alert("請輸入有效的秒數 (0-200秒)");
      return;
    }

    const itemObj = data.items.find(i => i.id === selectedItem);
    if (!itemObj) return;

    const now = new Date();
    const newRecord: TrainingRecord = {
      id: `t-${Date.now()}`,
      timestamp: now.getTime(),
      dateStr: now.toISOString().split('T')[0],
      itemId: selectedItem,
      itemName: itemObj.name,
      seconds: Number(val.toFixed(4)),
      note: note
    };

    onSave(newRecord);
    setSessionRecords(prev => [newRecord, ...prev]);
    
    // Reset for next rapid entry
    setSeconds('');
    setNote('');
    // Keep focus
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="space-y-6">
      {/* Input Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Clock className="mr-2 text-blue-600" />
          新增成績
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">測速項目</label>
            <div className="grid grid-cols-2 gap-2">
              {data.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item.id)}
                  className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                    selectedItem === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Seconds Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">成績 (秒)</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                step="0.0001"
                min="0"
                max="200"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="00.0000"
                className="w-full p-4 text-3xl font-mono font-bold text-center text-gray-800 bg-gray-50 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">sec</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Plus strokeWidth={3} />
            紀錄成績
          </button>
        </form>
      </div>

      {/* Session History (Rapid feedback) */}
      {sessionRecords.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">本次輸入紀錄</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {sessionRecords.map((record, index) => (
              <div key={record.id} className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-0 ${index === 0 ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{record.itemName}</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{record.seconds.toFixed(4)}s</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onDelete(record.id);
                    setSessionRecords(prev => prev.filter(r => r.id !== record.id));
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;