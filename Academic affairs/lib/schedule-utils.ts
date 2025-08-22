/**
 * Utility functions for course schedule management and conflict detection
 */
import { CourseSchedule } from "../components/course-context";

/**
 * Interface representing a time slot with day, start time, and end time
 */
export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

/**
 * Checks if two time slots overlap
 * @param slot1 First time slot
 * @param slot2 Second time slot
 * @returns True if the time slots overlap, false otherwise
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // If the days are different, there's no conflict
  if (slot1.day !== slot2.day) {
    return false;
  }

  // Convert time strings to minutes for easier comparison
  const slot1Start = timeStringToMinutes(slot1.startTime);
  const slot1End = timeStringToMinutes(slot1.endTime);
  const slot2Start = timeStringToMinutes(slot2.startTime);
  const slot2End = timeStringToMinutes(slot2.endTime);

  // Check for overlap
  // Slot1 starts during Slot2 OR Slot2 starts during Slot1
  return (
    (slot1Start >= slot2Start && slot1Start < slot2End) || 
    (slot2Start >= slot1Start && slot2Start < slot1End)
  );
}

/**
 * Converts a time string (HH:MM) to minutes since midnight
 * @param timeString Time in format "HH:MM" (24-hour format)
 * @returns Minutes since midnight
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Detects schedule conflicts between a course schedule and a list of existing schedules
 * @param schedule The schedule to check for conflicts
 * @param existingSchedules List of existing schedules to check against
 * @returns Array of conflicting schedules, empty if no conflicts
 */
export function detectScheduleConflicts(
  schedule: CourseSchedule,
  existingSchedules: CourseSchedule[]
): CourseSchedule[] {
  return existingSchedules.filter(existingSchedule => 
    // Don't compare with itself
    existingSchedule.id !== schedule.id && 
    // Check if time slots overlap
    doTimeSlotsOverlap(
      {
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      },
      {
        day: existingSchedule.day,
        startTime: existingSchedule.startTime,
        endTime: existingSchedule.endTime
      }
    )
  );
}

/**
 * Detects schedule conflicts between selected courses for a student
 * @param selectedCourseIds Array of selected course IDs
 * @param allSchedules All available course schedules
 * @returns Object containing conflicts information
 */
export function detectCourseScheduleConflicts(
  selectedCourseIds: string[],
  allSchedules: CourseSchedule[]
): { hasConflicts: boolean; conflicts: Array<{ course1: string; course2: string; day: string; time: string }> } {
  const conflicts: Array<{ course1: string; course2: string; day: string; time: string }> = [];
  const selectedCourseSchedules = allSchedules.filter(schedule => 
    selectedCourseIds.includes(schedule.courseId)
  );

  // Compare each schedule with every other schedule
  for (let i = 0; i < selectedCourseSchedules.length; i++) {
    for (let j = i + 1; j < selectedCourseSchedules.length; j++) {
      const schedule1 = selectedCourseSchedules[i];
      const schedule2 = selectedCourseSchedules[j];

      if (doTimeSlotsOverlap(
        {
          day: schedule1.day,
          startTime: schedule1.startTime,
          endTime: schedule1.endTime
        },
        {
          day: schedule2.day,
          startTime: schedule2.startTime,
          endTime: schedule2.endTime
        }
      )) {
        conflicts.push({
          course1: schedule1.courseId,
          course2: schedule2.courseId,
          day: schedule1.day,
          time: `${schedule1.startTime}-${schedule1.endTime} conflicts with ${schedule2.startTime}-${schedule2.endTime}`
        });
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}