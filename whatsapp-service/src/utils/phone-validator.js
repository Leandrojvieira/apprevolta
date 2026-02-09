export function validatePhone(phone) {
  if (!phone) {
    throw new Error('Telefone é obrigatório')
  }
  const clean = phone.toString().replace(/\D/g, '')
  if (clean.length < 10 || clean.length > 15) {
    throw new Error('Telefone deve ter entre 10 e 15 dígitos')
  }
  return clean
}
