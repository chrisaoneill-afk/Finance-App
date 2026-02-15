export type ParsedCsvRow = Record<string, string>;

export type NormalizedTransactionInput = {
  date: string;
  description: string;
  amount: number;
};
