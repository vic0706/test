import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { AppData, TrainingRecord } from '../types';
import { ChevronRight, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  data: AppData;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Get Upcoming Races (Top 2)
  const upcomingRaces = useMemo(() => {
    return data.races
      .filter(r => r.isUpcoming)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);
  }, [data.races]);

  // Group Training by Date
  const trainingByDate = useMemo(() => {
    const groups: Record<string, TrainingRecord[]> = {};
    data.training.forEach(r => {
      if (!groups[r.dateStr]) groups[r.dateStr] = [];
      groups[r.dateStr].push(r);
    });
    return groups;
  }, [data.training]);

  // Available dates sorted descending
  const sortedDates = useMemo(() => 
    Object.keys(trainingByDate).sort((a, b) => b.localeCompare(a)), 
    [trainingByDate]
  );

  // Set default selected date if empty
  if (!selectedDate && sortedDates.length > 0) {
    setSelectedDate(sortedDates[0]);
  }

  // Get data for selected date
  const dayRecords = selectedDate ? trainingByDate[selectedDate] : [];
  
  // Analyze items for the day
  const itemStats = useMemo(() => {
    if (!dayRecords.length) return [];
    
    // Group by item
    const byItem: Record<string, TrainingRecord[]> = {};
    dayRecords.forEach(r => {
      if (!byItem[r.itemId]) byItem[r.itemId] = [];
      byItem[r.itemId].push(r);
    });

    return Object.entries(byItem).map(([itemId, records]) => {
      const times = records.map(r => r.seconds);
      const min = Math.min(...times);
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const itemName = data.items.find(i => i.id === itemId)?.name || itemId;
      
      // Calculate stability (Standard Deviation)
      const squareDiffs = times.map(value => Math.pow(value - avg, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);

      return {
        id: itemId,
        name: itemName,
        count: records.length,
        best: min.toFixed(3),
        avg: avg.toFixed(3),
        stdDev: stdDev.toFixed(3),
        records: records.sort((a, b) => a.timestamp - b.timestamp).map((r, i) => ({
          idx: i + 1,
          seconds: r.seconds
        }))
      };
    }).filter(item => {
        // Only show items that are marked as default OR have data for this day
        // But logic above only processes items with data, so this is fine.
        // We could filter by data.items.isDefault if we only wanted to show defaults on dashboard.
        return true; 
    });
  }, [dayRecords, data.items]);

  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Upcoming Races Section */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">近期賽事公告</h2>
          {data.races.filter(r => r.isUpcoming).length > 2 && (
            <Link to="/races" className="text-xs text-blue-600 font-medium">查看更多</Link>
          )}
        </div>
        <div className="grid gap-3">
          {upcomingRaces.length > 0 ? (
            upcomingRaces.map(race => (
              <div key={race.id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold mb-1">
                        {race.category}
                      </span>
                      <h3 className="font-bold text-gray-800">{race.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Calendar size={14} className="mr-1" />
                        {race.date}
                      </div>
                    </div>
                    {/* Countdown logic could go here */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-xl text-center text-gray-400 text-sm border border-dashed border-gray-300">
              目前無近期賽事
            </div>
          )}
        </div>
      </section>

      {/* Training Stats Section */}
      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">訓練日誌分析</h2>
        
        {/* Date Selector Slider */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
          {sortedDates.map(date => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setExpandedChartId(null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDate === date 
                  ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        {/* Daily Details */}
        <div className="space-y-4">
          {itemStats.length > 0 ? (
            itemStats.map(stat => (
              <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => setExpandedChartId(expandedChartId === stat.id ? null : stat.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{stat.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {stat.count} 趟
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">最快秒數</p>
                        <p className="text-xl font-bold text-green-600 font-mono">{stat.best}s</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">平均秒數</p>
                        <p className="text-xl font-bold text-gray-700 font-mono">{stat.avg}s</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">配速穩定度</p>
                        <p className={`text-xl font-bold font-mono ${parseFloat(stat.stdDev) < 0.5 ? 'text-blue-500' : 'text-orange-500'}`}>
                          ±{stat.stdDev}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`text-gray-300 transition-transform duration-300 ${expandedChartId === stat.id ? 'rotate-90' : ''}`} 
                  />
                </div>

                {/* Expanded Chart Area */}
                {expandedChartId === stat.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 mb-2 text-center">單日配速趨勢圖</h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stat.records}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="idx" 
                            tick={{fontSize: 10}} 
                            axisLine={false} 
                            tickLine={false}
                            label={{ value: '趟次', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                          />
                          <YAxis 
                            domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                            hide={false}
                            width={30}
                            tick={{fontSize: 10}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => [`${value}s`, '秒數']}
                            labelFormatter={(label) => `第 ${label} 趟`}
                          />
                          <ReferenceLine y={parseFloat(stat.avg)} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right', fontSize: 10, fill: '#9ca3af' }} />
                          <Line 
                            type="monotone" 
                            dataKey="seconds" 
                            stroke="#2563eb" 
                            strokeWidth={2} 
                            dot={{ r: 3, fill: '#2563eb' }} 
                            activeDot={{ r: 5 }} 
                            animationDuration={500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400 text-center">
                       數值越平穩代表配速穩定度越高
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
              <AlertCircle className="mx-auto mb-2 opacity-50" />
              <p>該日無訓練資料</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;