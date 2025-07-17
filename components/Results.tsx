
import React from 'react';
import { type TestStats } from '../types';

interface ResultsProps {
  stats: TestStats;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ stats, onRestart }) => {
  const { wpm, time } = stats;

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl flex flex-col items-center gap-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-cyan-400">Kết quả</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center text-center">
        <div className="p-4 flex-1">
          <p className="text-5xl font-bold text-white">{wpm}</p>
          <p className="text-slate-400">từ mỗi phút (WPM)</p>
        </div>
        <div className="border-l border-slate-700 hidden md:block"></div>
        <div className="p-4 flex-1">
          <p className="text-5xl font-bold text-white">{time.toFixed(1)}s</p>
          <p className="text-slate-400">Thời gian</p>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="mt-6 px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Quay về
      </button>
    </div>
  );
};

export default Results;
