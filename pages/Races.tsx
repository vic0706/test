import React, { useState, useMemo } from 'react';
import { AppData, RaceCategory } from '../types';
import { Search, Trophy, MapPin, Calendar, Medal } from 'lucide-react';

interface Props {
  data: AppData;
}

const Races: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredRaces = useMemo(() => {
    return data.races.filter(race => {
      const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || race.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.races, searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-0 z-10">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜尋賽事名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            全部
          </button>
          {Object.values(RaceCategory).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Race List */}
      <div className="space-y-3">
        {filteredRaces.length > 0 ? (
          filteredRaces.map(race => (
            <div key={race.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4">
               {/* Rank Display */}
               <div className="flex flex-col items-center justify-center w-16 bg-gray-50 rounded-lg shrink-0 border border-gray-100">
                {race.isUpcoming ? (
                   <span className="text-xs font-bold text-blue-600 text-center px-1">即將<br/>參加</span>
                ) : (
                  <>
                    <Medal size={20} className={`mb-1 ${
                      race.rank.includes('1') || race.rank.includes('冠') ? 'text-yellow-500' : 
                      race.rank.includes('2') || race.rank.includes('亞') ? 'text-gray-400' :
                      race.rank.includes('3') || race.rank.includes('季') ? 'text-orange-600' : 'text-blue-900'
                    }`} />
                    <span className="text-xs font-bold text-gray-700 text-center break-words w-full px-1">{race.rank || '-'}</span>
                  </>
                )}
               </div>

               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                      {race.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar size={10} className="mr-1" />
                      {race.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{race.name}</h3>
                  
                  {race.photoUrl && (
                    <div className="mt-2">
                      <img src={race.photoUrl} alt="Race" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="mx-auto mb-2 opacity-30" size={40} />
            <p>找不到符合的賽事記錄</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Races;