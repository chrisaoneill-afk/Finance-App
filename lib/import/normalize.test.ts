import { describe, expect, it } from 'vitest';
import { buildFingerprint, normalizeDescription, normalizeRows } from './normalize';

describe('normalize helpers', () => {
  it('normalizes description whitespace and case', () => {
    expect(normalizeDescription('  ACME   STORE  ')).toBe('acme store');
  });

  it('builds stable fingerprint', () => {
    const fp1 = buildFingerprint({ userId: 'u1', accountId: 'a1', date: '2026-01-02', amount: -50.25, description: '  Grocery   Shop ' });
    const fp2 = buildFingerprint({ userId: 'u1', accountId: 'a1', date: '2026-01-02', amount: -50.25, description: 'grocery shop' });
    expect(fp1).toBe(fp2);
  });

  it('normalizes and inverts amounts when requested', () => {
    const rows = normalizeRows({
      rows: [{ Date: '2026-01-01', Desc: 'Coffee', Amt: '12.34' }],
      dateColumn: 'Date',
      descriptionColumn: 'Desc',
      amountColumn: 'Amt',
      invertAmountSign: true,
    });

    expect(rows[0].amount).toBe(-12.34);
  });
});
