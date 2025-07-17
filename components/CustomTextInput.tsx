import React, { useState } from 'react';

interface CustomTextInputProps {
  onStart: (text: string) => void;
  onBack: () => void;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ onStart, onBack }) => {
  const [text, setText] = useState('');

  const handleStart = () => {
    if (text.trim()) {
      onStart(text.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 items-center">
      <textarea
        className="w-full h-40 p-4 bg-slate-800/50 rounded-lg text-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Nhập văn bản của bạn ở đây..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleStart}
        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
      >
        Bắt đầu Gõ
      </button>
      <button onClick={onBack} className="mt-6 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
        Quay về
      </button>
    </div>
  );
};

export default CustomTextInput;