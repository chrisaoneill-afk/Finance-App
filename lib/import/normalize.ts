import { createHash } from 'crypto';
import { NormalizedTransactionInput, ParsedCsvRow } from './types';

export function normalizeDescription(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function monthKeyFromDate(dateValue: string): string {
  return new Date(dateValue).toISOString().slice(0, 7);
}

export function buildFingerprint(input: {
  userId: string;
  accountId: string;
  date: string;
  amount: number;
  description: string;
}): string {
  const base = `${input.userId}|${input.accountId}|${input.date}|${input.amount}|${normalizeDescription(input.description)}`;
  return createHash('sha256').update(base).digest('hex');
}

export function normalizeRows(params: {
  rows: ParsedCsvRow[];
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  invertAmountSign: boolean;
}): NormalizedTransactionInput[] {
  return params.rows
    .map((row) => {
      const rawAmount = Number(String(row[params.amountColumn]).replace(/[$,]/g, ''));
      const amount = params.invertAmountSign ? rawAmount * -1 : rawAmount;
      return {
        date: new Date(row[params.dateColumn]).toISOString().slice(0, 10),
        description: String(row[params.descriptionColumn] ?? ''),
        amount,
      };
    })
    .filter((row) => !Number.isNaN(row.amount) && row.description.trim() && row.date);
}
