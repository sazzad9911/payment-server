type NagadSMSParse = {
  amount?: number;
  txnId?: string;
};

const parseNagadSMS = (sms: string): NagadSMSParse => {
  const amountMatch = sms.match(/Amount:\s*Tk\s*([\d.]+)/i);
  const txnMatch = sms.match(/TxnID:\s*([A-Z0-9]+)/i);

  return {
    amount: amountMatch ? parseFloat(amountMatch[1]) : undefined,
    txnId: txnMatch ? txnMatch[1] : undefined,
  };
};

export const validateNagadPayment = (
  sms: string,
  expectedAmount: number,
  expectedTxnId: string,
  MSISDN: string,
): boolean => {
  const parsed = parseNagadSMS(sms);

  if (MSISDN !== "NAGAD") {
    return false;
  }

  if (!parsed.amount || !parsed.txnId) {
    return false;
  }

  return (
    parsed.amount === expectedAmount &&
    parsed.txnId.toUpperCase() === expectedTxnId.toUpperCase()
  );
};

const parseCashOutSMS = (sms: string): NagadSMSParse => {
  // get first Tk amount
  const amountMatch = sms.match(/Tk\s*([\d,]+\.\d{2})/i);

  // get trx id
  const txnMatch = sms.match(/TrxID\s*([A-Z0-9]+)/i);

  return {
    amount: amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : undefined,
    txnId: txnMatch ? txnMatch[1] : undefined,
  };
};

export const validateBkashPayment = (
  sms: string,
  expectedAmount: number,
  expectedTxnId: string,
  MSISDN: string,
): boolean => {
  const parsed = parseCashOutSMS(sms);

  if (MSISDN !== "bKash") {
    return false;
  }

  if (!parsed.amount || !parsed.txnId) return false;

  return (
    parsed.amount === expectedAmount &&
    parsed.txnId.toUpperCase() === expectedTxnId.toUpperCase()
  );
};
