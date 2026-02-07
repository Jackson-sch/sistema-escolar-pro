import { isSameDay } from "date-fns";

export interface Holiday {
  date: Date;
  name: string;
  isNational: boolean;
}

/**
 * Calculates Easter Sunday for a given year using the Anonymous Gregorian algorithm.
 */
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getPeruvianHolidays(year: number): Holiday[] {
  const easter = getEaster(year);
  
  // Jueves Santo: Thursday before Easter
  const juevesSanto = new Date(easter);
  juevesSanto.setDate(easter.getDate() - 3);
  
  // Viernes Santo: Friday before Easter
  const viernesSanto = new Date(easter);
  viernesSanto.setDate(easter.getDate() - 2);

  const holidays: Holiday[] = [
    { date: new Date(year, 0, 1), name: "Año Nuevo", isNational: true },
    { date: juevesSanto, name: "Jueves Santo", isNational: true },
    { date: viernesSanto, name: "Viernes Santo", isNational: true },
    { date: new Date(year, 4, 1), name: "Día del Trabajo", isNational: true },
    { date: new Date(year, 5, 7), name: "Batalla de Arica", isNational: true },
    { date: new Date(year, 5, 29), name: "San Pedro y San Pablo", isNational: true },
    { date: new Date(year, 6, 23), name: "Día de la Fuerza Aérea", isNational: true },
    { date: new Date(year, 6, 28), name: "Fiestas Patrias", isNational: true },
    { date: new Date(year, 6, 29), name: "Fiestas Patrias", isNational: true },
    { date: new Date(year, 7, 6), name: "Batalla de Junín", isNational: true },
    { date: new Date(year, 7, 30), name: "Santa Rosa de Lima", isNational: true },
    { date: new Date(year, 9, 8), name: "Combate de Angamos", isNational: true },
    { date: new Date(year, 10, 1), name: "Todos los Santos", isNational: true },
    { date: new Date(year, 11, 8), name: "Inmaculada Concepción", isNational: true },
    { date: new Date(year, 11, 9), name: "Batalla de Ayacucho", isNational: true },
    { date: new Date(year, 11, 25), name: "Navidad", isNational: true },
  ];

  return holidays;
}

export function isHoliday(date: Date): Holiday | undefined {
  const holidays = getPeruvianHolidays(date.getFullYear());
  return holidays.find(h => isSameDay(h.date, date));
}
