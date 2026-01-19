import React, { useState } from 'react';
import { AppData, SpeedTestItem, RaceRecord, TrainingRecord } from '../types';
import { Trash2, PlusCircle, FileUp, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdateItems: (items: SpeedTestItem[]) => void;
  onImportData: (data: Partial<AppData>) => void;
}

const Settings: React.FC<Props> = ({ data, onUpdateItems, onImportData }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem: SpeedTestItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      isDefault: false
    };
    onUpdateItems([...data.items, newItem]);
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('確定刪除此測速項目? 相關的歷史成績名稱不會改變，但無法再新增此項目。')) {
      onUpdateItems(data.items.filter(i => i.id !== id));
    }
  };

  const handleToggleDefault = (id: string) => {
    onUpdateItems(data.items.map(i => 
      i.id === id ? { ...i, isDefault: !i.isDefault } : i
    ));
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Very basic CSV parser: Date,Item,Seconds,Note
      const lines = text.split('\n');
      const newRecords: TrainingRecord[] = [];
      
      lines.forEach((line, idx) => {
        if (idx === 0) return; // Skip header
        const [date, itemName, secondsStr, note] = line.split(',');
        if (date && secondsStr) {
           const seconds = parseFloat(secondsStr);
           if (!isNaN(seconds)) {
             // Find matching item ID or use custom
             const matchedItem = data.items.find(i => i.name === itemName.trim()) || data.items[0];
             
             newRecords.push({
               id: `imp-${Date.now()}-${idx}`,
               timestamp: new Date(date).getTime(),
               dateStr: date.trim(), // Assuming YYYY-MM-DD
               itemId: matchedItem.id,
               itemName: itemName.trim() || matchedItem.name,
               seconds: seconds,
               note: note?.trim()
             });
           }
        }
      });

      if (newRecords.length > 0) {
        alert(`成功導入 ${newRecords.length} 筆資料`);
        onImportData({ training: [...data.training, ...newRecords] });
      } else {
        alert('無法讀取資料，請確認 CSV 格式 (Date,Item,Seconds,Note)');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      
      {/* Manage Items */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <SettingsIcon className="mr-2 text-blue-600" size={20} />
          測速項目管理
        </h2>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="輸入新項目名稱 (ex: S型彎道)"
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleAddItem}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
          >
            <PlusCircle size={16} className="mr-1" />
            新增
          </button>
        </div>

        <div className="space-y-2">
          {data.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-bold text-gray-700">{item.name}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={item.isDefault} 
                    onChange={() => handleToggleDefault(item.id)}
                    className="sr-only peer"
                   />
                   <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                   <span className="ml-2 text-xs text-gray-500">預設</span>
                </label>
                {!['10m', '30m'].includes(item.id) && (
                  <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Import Data */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FileUp className="mr-2 text-blue-600" size={20} />
          資料導入
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">選擇 CSV 檔案將訓練數據導入資料庫<br/>(格式: Date, Item, Seconds, Note)</p>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleCSVImport}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-bold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-5">
         <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-bold">注意事項</h3>
              <p className="text-xs mt-1 opacity-80">本系統目前使用瀏覽器儲存空間 (LocalStorage)。若清除瀏覽器快取，資料將會遺失。建議定期使用截圖或 CSV 備份重要成績。</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Settings;