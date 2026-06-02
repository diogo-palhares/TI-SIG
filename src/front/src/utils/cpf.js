// Validação de CPF (algoritmo dos dígitos verificadores) e formatação.

export function onlyDigits(value) {
  return (value || '').replace(/\D/g, '');
}

export function isValidCPF(cpf) {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) soma += parseInt(digits[i - 1], 10) * (11 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits[9], 10)) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(digits[i - 1], 10) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits[10], 10)) return false;

  return true;
}

export function formatCPF(cpf) {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return cpf || '';
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
