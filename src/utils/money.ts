import { TAX_RATE_PERCENT } from '../data/constants';

export interface OrderLine {
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

// Handles "$1,234.56", "$9.99 each" and "Qty: 2 × $9.99" (takes the first amount).
export function parseMoney(text: string): number {
  const match = text.replace(/,/g, '').match(/\$\s*(-?\d+(?:\.\d+)?)/);
  if (!match) {
    throw new Error(`Could not parse a currency amount from "${text}"`);
  }
  return Number(match[1]);
}

export const toCents = (amount: number): number => Math.round(amount * 100);

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;

// Works in cents to avoid floating-point errors. Tax is rounded to the nearest cent.
export function calculateOrderTotals(lines: OrderLine[], taxRatePercent = TAX_RATE_PERCENT): OrderTotals {
  const subtotalCents = lines.reduce((sum, line) => sum + toCents(line.unitPrice) * line.quantity, 0);
  const taxCents = Math.round((subtotalCents * taxRatePercent) / 100);
  return {
    subtotal: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
  };
}

export const lineTotal = (line: OrderLine): number => fromCents(toCents(line.unitPrice) * line.quantity);
