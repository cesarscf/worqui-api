export function centsToBRL(cents: string): string {
  const value = Number(cents)
  return (value / 100).toFixed(2)
}

export function brlToCents(reais: string | number): string {
  const value = typeof reais === "string" ? Number.parseFloat(reais) : reais
  return String(Math.round(value * 100))
}
