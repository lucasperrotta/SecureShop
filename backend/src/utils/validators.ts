// ============ CPF VALIDATION ============
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;
  
  return true;
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return `***.${clean.substring(3, 6)}.***-**`;
}

// ============ PHONE VALIDATION ============
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 11;
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.substring(0, 2)}) ****-${clean.substring(7)}`;
  }
  return `(${clean.substring(0, 2)}) ****-${clean.substring(6)}`;
}

// ============ CREDIT CARD VALIDATION ============
export function validateCreditCard(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  
  // Luhn Algorithm
  let sum = 0;
  let isEven = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function formatCreditCard(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskCreditCard(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function getCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^(6011|65|64[4-9])/.test(clean)) return 'Discover';
  if (/^(36|38|30[0-5])/.test(clean)) return 'Diners';
  return 'Unknown';
}

// ============ EMAIL VALIDATION ============
export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

// ============ CEP VALIDATION ============
export function validateCEP(cep: string): boolean {
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8;
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// ============ GENERAL VALIDATIONS ============
export function validateName(name: string): boolean {
  return name.length >= 3 && name.length <= 100;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[^a-zA-Z0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true };
}
