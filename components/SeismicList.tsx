
import React, { useState } from 'react';
import { SeismicEvent } from '../src/services/SeismicService';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SeismicListProps {
  events: SeismicEvent[];
  onEventSelect: (event: SeismicEvent) => void;
}

const SeismicList: React.FC<SeismicListProps> = ({ events, onEventSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = events.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-slate-900 h-full flex flex-col">
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-xs font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800">Mag</th>
              <th className="p-3 text-xs font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800">Location</th>
              <th className="p-3 text-xs font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {currentEvents.map((event) => (
              <tr 
                key={event.id}
                onClick={() => onEventSelect(event)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="p-3">
                  <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${
                    (event.magnitude || 0) >= 6 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    (event.magnitude || 0) >= 4 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {event.magnitude?.toFixed(1)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="text-sm font-medium text-slate-300 group-hover:text-white truncate max-w-[180px]">
                    {event.location}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                    {event.depth} km depth
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="text-xs text-slate-400 font-mono">
                    {(() => {
                      if (!event.date) return '-';
                      const date = new Date(event.date);
                      if (isNaN(date.getTime())) return event.date;
                      try {
                        return format(date, 'MMM d');
                      } catch (e) {
                        return event.date;
                      }
                    })()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {(() => {
                      if (!event.date) return '';
                      const date = new Date(event.date);
                      if (isNaN(date.getTime())) return '';
                      try {
                        return format(date, 'HH:mm');
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">
            Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
            <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SeismicList;
