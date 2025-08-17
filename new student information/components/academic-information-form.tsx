"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "@/app/register/page"
import { getProgramNames, COLLEGE_PROGRAM_NAMES, getProgramsByCategory, getProgramDuration } from "@/lib/program-utils"

interface AcademicInformationFormProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

export default function AcademicInformationForm({ data, updateData }: AcademicInformationFormProps) {
  const [programmes, setProgrammes] = useState<string[]>(COLLEGE_PROGRAM_NAMES);
  const [loading, setLoading] = useState(true);
  const [programCategories, setProgramCategories] = useState(getProgramsByCategory());
  const [programDuration, setProgramDuration] = useState<number>(4);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true);

  // Fetch programs from database
  useEffect(() => {
    // Try to get cached programs first
    const cachedPrograms = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('programNames') || '[]') : [];
    
    if (cachedPrograms.length > 0) {
      setProgrammes(cachedPrograms);
      setLoading(false);
    }
    
    // Then fetch from database
    const fetchPrograms = async () => {
      try {
        const programNames = await getProgramNames();
        setProgrammes(programNames);
        
        // Cache the results
        if (typeof window !== 'undefined') {
          localStorage.setItem('programNames', JSON.stringify(programNames));
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        // If there's an error, fallback to the static list
        setProgrammes(COLLEGE_PROGRAM_NAMES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, []);

  // Directly generate the years first for immediate display
  useEffect(() => {
    // Immediately generate fallback years for quick display
    const years = generateFallbackYears();
    console.log("Setting initial fallback years:", years);
    setAcademicYears(years);
    
    // If no academic year is selected, set a default, but don't force year of entry
    if (!data.entryAcademicYear && years.length > 0) {
      // Find current year
      const currentYear = new Date().getFullYear();
      const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
      
      // First try to find current academic year
      const matchingYear = years.find(y => y === currentAcademicYear);
      if (matchingYear) {
        console.log("Setting initial academic year:", matchingYear);
        updateData({ entryAcademicYear: matchingYear });
      } else if (years.length > 0) {
        // Default to the most recent year if no current year is found
        console.log("No current year found, using most recent:", years[0]);
        updateData({ entryAcademicYear: years[0] });
      }
    }
  }, []);

  // Generate fallback years from 2010 to 2026
  const generateFallbackYears = () => {
    const years = [];
    for (let year = 2010; year <= 2026; year++) {
      years.push(`${year}/${year + 1}`);
    }
    // Sort newest first
    return years.sort((a, b) => {
      const yearA = parseInt(a.split('/')[0]);
      const yearB = parseInt(b.split('/')[0]);
      return yearB - yearA;
    });
  };

  // Then try to fetch from API
  useEffect(() => {
    const fetchAcademicYears = async () => {
      setLoadingAcademicYears(true);
      
      // Always set fallback years first to ensure we have something
      const fallbackYears = generateFallbackYears();
      setAcademicYears(fallbackYears);
      
      try {
        console.log("Fetching academic years from API...");
        
        // Try to get from API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          const response = await fetch('/api/academic-years', { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              // If we have years from API, use them, otherwise keep fallback
              console.log("API returned years:", data);
              setAcademicYears(data);
            } else {
              console.warn("API returned empty or invalid data, keeping fallback years");
            }
          } else {
            console.error("API request failed:", response.status);
            console.log("Using fallback academic years");
            // We already set fallback years above
          }
        } catch (fetchError) {
          const error = fetchError as { name?: string };
          if (error.name === 'AbortError') {
            console.warn("API request timed out, using fallback years");
          } else {
            console.error("Fetch error:", fetchError);
          }
          // Fallback years already set
        }
      } catch (error) {
        console.error("Error in academic years logic:", error);
        // Fallback years already set
      } finally {
        setLoadingAcademicYears(false);
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Calculate current level based on academic year of entry
  const calculateCurrentLevel = useCallback((academicYearOfEntry: string, entryLevel: string) => {
    if (!academicYearOfEntry || !entryLevel) return entryLevel || "100";
    
    // Parse academic year (e.g., "2025/2026" -> 2025)
    const entryYear = parseInt(academicYearOfEntry.split('/')[0]);
    const currentYear = new Date().getFullYear();
    const entryLevelNum = parseInt(entryLevel);
    
    // Calculate academic years since entry
    // If student entered in 2025/2026 and we're in 2025 = same year = 0 years = Level 100
    // If student entered in 2024/2025 and we're in 2025 = 1 year later = Level 200
    const academicYearsSinceEntry = currentYear - entryYear;
    
    // Calculate current level based on academic years progression
    // Each academic year advances one level (100 -> 200 -> 300 -> 400)
    let currentLevel = entryLevelNum + (academicYearsSinceEntry * 100);
    
    // Cap at reasonable maximum levels (4-year programs typically)
    const maxLevel = entryLevelNum + 300; // Maximum 4 levels above entry
    currentLevel = Math.min(currentLevel, maxLevel);
    
    // Ensure we don't go below entry level
    currentLevel = Math.max(currentLevel, entryLevelNum);
    
    return currentLevel.toString();
  }, []);

  // Auto-update current level when academic year of entry or entry level changes
  useEffect(() => {
    if (data.entryAcademicYear && data.entryLevel) {
      const calculatedLevel = calculateCurrentLevel(data.entryAcademicYear, data.entryLevel);
      
      // Always update to the calculated level
      if (calculatedLevel !== data.currentLevel) {
        updateData({ currentLevel: calculatedLevel });
      }
    }
  }, [data.entryAcademicYear, data.entryLevel, calculateCurrentLevel, updateData]);

  // Update program duration when program changes
  useEffect(() => {
    if (data.programme) {
      const duration = getProgramDuration(data.programme);
      setProgramDuration(duration);
      
      // Reset current level if it's higher than the program duration
      const currentLevelNum = parseInt(data.currentLevel || "100");
      if (currentLevelNum > duration * 100) {
        updateData({ currentLevel: (duration * 100).toString() });
      }
    }
  }, [data.programme]);

  const entryQualifications = ["WASSCE", "SSSCE", "GCE A-Level", "Diploma", "HND", "Mature Entry", "Other"];

  // Define entry levels based on program type
  const getEntryLevels = () => {
    // For certificate programs, only level 100 is valid
    if (programDuration === 1) {
      return ["100"];
    }
    
    // For degree programs, entry at 100, 200, or 300 is possible
    return ["100", "200", "300"];
  };
  
  const entryLevels = getEntryLevels();
  
  // Dynamically generate current levels based on program duration
  const getCurrentLevels = () => {
    const levels = [];
    for (let i = 1; i <= programDuration; i++) {
      levels.push((i * 100).toString());
    }
    return levels;
  };

  const currentLevels = getCurrentLevels();
  
  // Get available period options based on schedule type
  const getCurrentPeriodOptions = () => {
    if (data.scheduleType === "Weekend") {
      return [
        { value: "First Trimester", label: "First Trimester (Oct-Dec)" },
        { value: "Second Trimester", label: "Second Trimester (Feb-May)" },
        { value: "Third Trimester", label: "Third Trimester (Jun-Aug)" }
      ];
    } else {
      // Default to Regular schedule
      return [
        { value: "First Semester", label: "First Semester (Sep-Dec)" },
        { value: "Second Semester", label: "Second Semester (Feb-May)" }
      ];
    }
  };
  
  const currentPeriodOptions = getCurrentPeriodOptions();
  
  // Set default values if not already set
  useEffect(() => {
    if (!data.entryLevel) {
      updateData({ entryLevel: "100" });
    }
    
    if (!data.currentLevel) {
      updateData({ currentLevel: "100" });
    }
    
    if (!data.scheduleType) {
      updateData({ scheduleType: "Regular" });
    }
    
    // Set default current period if not set
    if (!data.currentPeriod) {
      const defaultPeriod = data.scheduleType === "Weekend" 
        ? "First Trimester"
        : "First Semester";
      updateData({ currentPeriod: defaultPeriod });
    }
  }, []);
  
  // When schedule type changes, update period options
  useEffect(() => {
    if (data.scheduleType) {
      // If schedule type changes, update current period to first period of that type
      const defaultPeriod = data.scheduleType === "Weekend" 
        ? "First Trimester" 
        : "First Semester";
      
      updateData({ currentPeriod: defaultPeriod });
    }
  }, [data.scheduleType]);

  // Update handler for academic year
  const handleAcademicYearChange = useCallback((value: string) => {
    console.log("Setting academic year to:", value);
    updateData({ entryAcademicYear: value });
    
    // Update year of entry if empty
    if (value && (!data.yearOfEntry || data.yearOfEntry === "")) {
      const year = value.split('/')[0];
      console.log("Setting initial year of entry:", year);
      updateData({ yearOfEntry: year });
    }
  }, [updateData, data.yearOfEntry]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
        <p className="text-sm text-gray-600 mb-6">Please provide your academic and programme details</p>
      </div>

      {/* Debug message showing how many years are available */}
      <div className="text-xs text-blue-600 mb-2">
        {academicYears.length > 0 
          ? `${academicYears.length} academic years available (${academicYears[0]} to ${academicYears[academicYears.length-1]})`
          : "Loading academic years..."}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programme">Programme *</Label>
            <Select value={data.programme} onValueChange={(value) => updateData({ programme: value })}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading programs..." : "Select your programme"} />
              </SelectTrigger>
              <SelectContent>
                {/* Degree Programs */}
                <SelectGroup>
                  <SelectLabel>{programCategories.degree.title}</SelectLabel>
                  {programCategories.degree.programs.map((programme) => (
                    <SelectItem key={programme} value={programme}>
                      {programme}
                    </SelectItem>
                  ))}
                  <SelectItem value="Certificate in Environmental Science">
                    Certificate in Environmental Science
                  </SelectItem>
                </SelectGroup>
                
                {/* Diploma Programs */}
                <SelectGroup>
                  <SelectLabel>2-Year Diploma Programme</SelectLabel>
                  <SelectItem value="Diploma in Organic Agriculture">
                    Diploma in Organic Agriculture
                  </SelectItem>
                </SelectGroup>
                
                {/* Certificate Programs */}
                <SelectGroup>
                  <SelectLabel>{programCategories.certificate.title}</SelectLabel>
                  {programCategories.certificate.programs.map((programme) => (
                    <SelectItem key={programme} value={programme}>
                      {programme}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {data.programme && (
              <p className="text-xs text-blue-600 mt-1">
                {programDuration}-year {data.programme.includes('Certificate') ? 'certificate course' : 'degree program'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule Type *</Label>
            <Select
              value={data.scheduleType}
              onValueChange={(value) => updateData({ scheduleType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular (Weekday)</SelectItem>
                <SelectItem value="Weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              {data.scheduleType === "Weekend" ? (
                <div className="text-xs text-gray-700">
                  <p className="font-medium mb-1">Weekend students attend classes on weekends with 3 trimesters per year:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>First trimester: October to December</li>
                    <li>Second trimester: February to May</li>
                    <li>Third trimester: June to August</li>
                  </ul>
                </div>
              ) : (
                <div className="text-xs text-gray-700">
                  <p className="font-medium mb-1">Regular students attend classes on weekdays with 2 semesters per year:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>First semester: September to December</li>
                    <li>Second semester: February to May</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryAcademicYear">Academic Year of Entry *</Label>
            <div className="relative">
              <select
                id="entryAcademicYear"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.entryAcademicYear || ''}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                disabled={loadingAcademicYears}
              >
                <option value="" disabled>
                  {loadingAcademicYears ? "Loading academic years..." : "Select academic year"}
                </option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The academic year when you first enrolled
            </p>
          </div>



          <div className="space-y-2">
            <Label htmlFor="entryQualification">Entry Qualification *</Label>
            <Select
              value={data.entryQualification}
              onValueChange={(value) => updateData({ entryQualification: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your entry qualification" />
              </SelectTrigger>
              <SelectContent>
                {entryQualifications.map((qualification) => (
                  <SelectItem key={qualification} value={qualification}>
                    {qualification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryLevel">Entry Level *</Label>
            <Select value={data.entryLevel} onValueChange={(value) => updateData({ entryLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your entry level" />
              </SelectTrigger>
              <SelectContent>
                {entryLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data.programme && data.programme.includes('Certificate') && (
              <p className="text-xs text-gray-500 mt-1">
                Certificate programs only have entry at Level 100
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentLevel">Current Level *</Label>
            <Select value={data.currentLevel} onValueChange={(value) => updateData({ currentLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your current level" />
              </SelectTrigger>
              <SelectContent>
                {currentLevels
                  .filter(level => !data.entryLevel || parseInt(level) >= parseInt(data.entryLevel))
                  .map((level) => (
                    <SelectItem key={level} value={level}>
                      Level {level}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {data.entryLevel && data.currentLevel && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">
                  Current level must be at least your entry level
                </p>

              </div>
            )}
          </div>

          {/* Field for current period (semester/trimester) */}
          <div className="space-y-2">
            <Label htmlFor="currentPeriod">Current {data.scheduleType === "Weekend" ? "Trimester" : "Semester"} *</Label>
            <Select 
              value={data.currentPeriod} 
              onValueChange={(value) => updateData({ currentPeriod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select your current ${data.scheduleType === "Weekend" ? "trimester" : "semester"}`} />
              </SelectTrigger>
              <SelectContent>
                {currentPeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              The {data.scheduleType === "Weekend" ? "trimester" : "semester"} you are currently in or about to start
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hallOfResidence">Hall of Residence</Label>
            <Input
              id="hallOfResidence"
              value={data.hallOfResidence}
              onChange={(e) => updateData({ hallOfResidence: e.target.value.toUpperCase() })}
              placeholder="Enter hall of residence (if applicable)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
