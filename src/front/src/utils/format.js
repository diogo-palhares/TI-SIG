// Funções utilitárias de formatação de datas e cálculo de idade.

// Recebe "yyyy-MM-dd" (ou ISO) e devolve "dd/mm/yyyy".
export function formatDate(value) {
  if (!value) return '';
  const datePart = String(value).split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) {
    const d = new Date(value);
    return isNaN(d) ? '' : d.toLocaleDateString('pt-BR');
  }
  const [ano, mes, dia] = parts;
  return `${dia}/${mes}/${ano}`;
}

export function calcAge(birthdate) {
  if (!birthdate) return '';
  const nascimento = new Date(birthdate);
  if (isNaN(nascimento)) return '';
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return `${idade} anos`;
}
