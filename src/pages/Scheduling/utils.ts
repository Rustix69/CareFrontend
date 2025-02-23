import {
  addMinutes,
  format,
  isSameDay,
  isWithinInterval,
  parse,
} from "date-fns";

import { Time } from "@/Utils/types";
import {
  Appointment,
  ScheduleAvailability,
  ScheduleException,
} from "@/types/scheduling/schedule";

export const isDateInRange = (
  date: Date,
  startDate: string,
  endDate: string,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    isWithinInterval(date, { start, end }) ||
    isSameDay(date, start) ||
    isSameDay(date, end)
  );
};

export function getDurationInMinutes(startTime: Time, endTime: Time) {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  if (
    start.toString() === "Invalid Date" ||
    end.toString() === "Invalid Date"
  ) {
    return null;
  }

  return (end.getTime() - start.getTime()) / (1000 * 60);
}

type VirtualSlot = {
  start_time: Time;
  end_time: Time;
  isAvailable: boolean;
  exceptions: ScheduleException[];
};

export function computeAppointmentSlots(
  availability: ScheduleAvailability & { slot_type: "appointment" },
  exceptions: ScheduleException[],
  referenceDate: Date = new Date(),
) {
  const startTime = parse(
    availability.availability[0].start_time,
    "HH:mm:ss",
    referenceDate,
  );
  const endTime = parse(
    availability.availability[0].end_time,
    "HH:mm:ss",
    referenceDate,
  );
  const slotSizeInMinutes = availability.slot_size_in_minutes;
  const slots: VirtualSlot[] = [];

  let time = startTime;
  while (time < endTime) {
    const slotEndTime = addMinutes(time, slotSizeInMinutes);

    let conflicting = false;
    for (const exception of exceptions) {
      const exceptionStartTime = parse(
        exception.start_time,
        "HH:mm:ss",
        referenceDate,
      );
      const exceptionEndTime = parse(
        exception.end_time,
        "HH:mm:ss",
        referenceDate,
      );

      if (exceptionStartTime < slotEndTime && exceptionEndTime > time) {
        conflicting = true;
        break;
      }
    }

    if (!conflicting) {
      slots.push({
        start_time: format(time, "HH:mm") as Time,
        end_time: format(slotEndTime, "HH:mm") as Time,
        isAvailable: true,
        exceptions: [],
      });
    }

    time = slotEndTime;
  }

  return slots;
}

export function getSlotsPerSession(
  startTime: Time,
  endTime: Time,
  slotSizeInMinutes: number,
) {
  const duration = getDurationInMinutes(startTime, endTime);
  if (!duration) return null;
  const result = Math.floor(duration / slotSizeInMinutes);
  return result < 0 ? null : result;
}

export function getTokenDuration(
  slotSizeInMinutes: number,
  tokensPerSlot: number,
) {
  return slotSizeInMinutes / tokensPerSlot;
}

export const getDaysOfWeekFromAvailabilities = (
  availabilities: ScheduleAvailability[],
) => {
  return [
    ...new Set(
      availabilities.flatMap(({ availability }) => {
        return availability.map(({ day_of_week }) => day_of_week);
      }),
    ),
  ];
};

export const filterAvailabilitiesByDayOfWeek = (
  availabilities: ScheduleAvailability[],
  date?: Date,
) => {
  // Doing this weird things because backend uses python's 0-6.
  // TODO: change to strings at seriazlier level...? or bitwise operations?
  const dayOfWeek = ((date ?? new Date()).getDay() + 6) % 7;

  return availabilities.filter(({ availability }) =>
    availability.some((a) => a.day_of_week === dayOfWeek),
  );
};

/**
 * TODO: Remove this once we have token number generation system.
 * This is a temporary function to generate a fake token number for an appointment.
 */
export const getFakeTokenNumber = (appointment: Appointment) => {
  // Convert UUID to a number by summing char codes
  const hash = appointment.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Get a number between 10-99
  return (hash % 90) + 10;
};
