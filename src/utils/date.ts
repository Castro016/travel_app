const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];


const WEEKDAYS_SHORT = [
  'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
];

// Auxiliar para obter a data local no formato YYYY-MM-DD
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Converte "2026-06-03" -> "03/06/2026"
export function formatDateSlash(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Converte "2026-06-03" -> "03 de Junho, 2026"
export function formatDateFull(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const monthName = MONTHS[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} de ${monthName}, ${year}`;
}

// Converte "2026-06-03" -> "03 de Jun"
export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const [, month, day] = dateString.split('-');
  const monthName = MONTHS_SHORT[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} de ${monthName}`;
}

// Converte "2026-06-03" -> "Quarta, 03 de Jun"
export function formatDateTimeline(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const weekday = WEEKDAYS_SHORT[date.getDay()];
  const monthName = MONTHS_SHORT[parseInt(month, 10) - 1];
  return `${weekday}, ${parseInt(day, 10)} de ${monthName}`;
}

// Diferença de dias entre duas datas (startDate, endDate: YYYY-MM-DD)
export function getDaysDifference(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 0; // Inclui o dia de início (+1)
}

// Retorna dias restantes para a viagem (se começou, se terminou ou quantos dias faltam)
export function getTripStatusText(startDate: string, endDate: string): string {
  const todayStr = getTodayDateString();
  
  if (todayStr > endDate) {
    return 'Finalizada';
  }
  
  if (todayStr >= startDate && todayStr <= endDate) {
    return 'Em andamento';
  }
  
  // Faltam dias
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);
  const start = new Date(sy, sm - 1, sd);
  
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Começa amanhã';
  return `Faltam ${diffDays} dias`;
}

// Retorna uma lista de strings YYYY-MM-DD contendo todos os dias entre startDate e endDate inclusive
export function getDatesListBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  if (!startDate || !endDate) return dates;
  
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Formata data Date de JS para string YYYY-MM-DD
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Formata hora Date de JS para HH:MM
export function timeToString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
