const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const dateLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export function money(value: number): string {
  return brlFormatter.format(value);
}

export function centsToMoney(cents?: number): string {
  return money((cents || 0) / 100);
}

export function centsToNumber(cents?: number): number {
  return (cents || 0) / 100;
}

export function roundNumberUp(num: number, precision: number): string {
  const factor = Math.pow(10, precision);
  return (Math.round(num * factor) / factor).toFixed(precision);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatCard(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatDateLabel(dateValue?: string): string {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return dateLabelFormatter.format(date);
}
