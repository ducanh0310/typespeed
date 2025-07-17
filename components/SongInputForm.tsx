
import React, { useState } from 'react';
import Spinner from './Spinner';

interface SongInputFormProps {
  onSubmit: (songTitle: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const SongInputForm: React.FC<SongInputFormProps> = ({ onSubmit, isLoading, onBack }) => {
  const [songTitle, setSongTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (songTitle.trim() && !isLoading) {
      onSubmit(songTitle.trim());
    }
  };

  return (
    <div className="w-full max-w-xl text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
        Lyric<span className="text-cyan-400">Typer</span>
      </h1>
      <p className="text-slate-400 mb-8 text-lg">
        Nhập tên bài hát để bắt đầu kiểm tra tốc độ gõ của bạn.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="Ví dụ: Nơi này có anh"
          className="flex-grow px-5 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !songTitle.trim()}
          className="flex justify-center items-center px-6 py-3 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner className="w-5 h-5" /> : 'Tìm lời bài hát'}
        </button>
      </form>
      <button onClick={onBack} className="mt-6 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
        Quay về
      </button>
    </div>
  );
};

export default SongInputForm;
