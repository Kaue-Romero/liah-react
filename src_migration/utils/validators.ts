import { onlyDigits } from './format';

export function validateCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== Number(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === Number(cpf.charAt(10));
}

export function validateName(name: string): boolean {
  return name.trim().split(/\s+/).length >= 2;
}

export function validateEmail(email: string): boolean {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email.trim()
  );
}

export function isWhatsappNumber(value: string): boolean {
  const phone = onlyDigits(value);
  return phone.length >= 10 && phone.length <= 13;
}
