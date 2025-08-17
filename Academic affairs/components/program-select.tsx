'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { getProgramNames } from '@/lib/programs-db';

interface ProgramSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function ProgramSelect({
  value,
  onValueChange,
  label = 'Program',
  placeholder = 'Select a program',
  disabled = false,
  required = false,
  error,
  className = '',
}: ProgramSelectProps) {
  const [programs, setPrograms] = useState<{id: string; name: string; code: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        
        const programList = await getProgramNames();
        setPrograms(programList);
      } catch (error) {
        console.error('Error loading programs:', error);
        setLoadError('Failed to load programs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPrograms();
  }, []);
  
  return (
    <div className={className}>
      {label && (
        <Label htmlFor="program" className="mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id="program" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={loading ? 'Loading programs...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loadError ? (
            <div className="p-2 text-center text-red-500 text-sm">{loadError}</div>
          ) : programs.length === 0 && !loading ? (
            <div className="p-2 text-center text-gray-500 text-sm">No programs available</div>
          ) : (
            programs
              .filter(program => program.id && program.id.trim() !== "")
              .map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name} ({program.code})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
} 