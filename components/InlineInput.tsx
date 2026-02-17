import React, { useEffect, useState } from 'react';

interface InlineInputProps {
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({ value, onChange, className = '', placeholder }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      className={`outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${className}`}
      placeholder={placeholder}
    />
  );
};