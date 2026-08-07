import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, Check } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface ColumnFilterHeaderProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  align?: 'left' | 'center' | 'right';
}

export default function ColumnFilterHeader({
  title,
  options,
  selectedValue,
  onChange,
  align = 'left'
}: ColumnFilterHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = selectedValue !== '' && selectedValue !== 'ALL';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`} ref={containerRef}>
      <span>{title}</span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded-lg transition-all ${
          isActive 
            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300' 
            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
        }`}
        title={`Filtrar por ${title}`}
      >
        <Filter size={13} className={isActive ? 'fill-current' : ''} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-2 z-50 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 font-sans normal-case tracking-normal text-left text-slate-800 animate-in fade-in zoom-in-95 duration-150 ${
          align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
        }`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-xs font-black uppercase text-slate-700">Filtrar {title}</span>
            {isActive && (
              <button
                onClick={() => {
                  onChange('ALL');
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5"
              >
                <X size={10} /> Limpar
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
