// Utilidades de formato para Quebec (CAD, fr-CA).

const CAD = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

/** 1650 -> "1 650 $" (formato canadiense). */
export function formatCAD(value: number | null | undefined): string {
  if (value == null) return '—';
  return CAD.format(value);
}

/** Combina unidad + calle + ciudad: "5-123 Main St, Montréal". */
export function buildAddress(p: {
  unit_number?: string | null;
  street: string;
  city: string;
}): string {
  const base = p.unit_number ? `${p.unit_number}-${p.street}` : p.street;
  return `${base}, ${p.city}`;
}
