"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBkashPayment = exports.validateNagadPayment = void 0;
const parseNagadSMS = (sms) => {
    const amountMatch = sms.match(/Amount:\s*Tk\s*([\d.]+)/i);
    const txnMatch = sms.match(/TxnID:\s*([A-Z0-9]+)/i);
    return {
        amount: amountMatch ? parseFloat(amountMatch[1]) : undefined,
        txnId: txnMatch ? txnMatch[1] : undefined,
    };
};
const validateNagadPayment = (sms, expectedAmount, expectedTxnId, MSISDN) => {
    const parsed = parseNagadSMS(sms);
    if (MSISDN !== "NAGAD") {
        return false;
    }
    if (!parsed.amount || !parsed.txnId) {
        return false;
    }
    return (parsed.amount === expectedAmount &&
        parsed.txnId.toUpperCase() === expectedTxnId.toUpperCase());
};
exports.validateNagadPayment = validateNagadPayment;
const parseCashOutSMS = (sms) => {
    const amountMatch = sms.match(/Cash\s*Out\s*Tk\s*([\d.]+)/i);
    const txnMatch = sms.match(/TrxID\s*([A-Z0-9]+)/i);
    return {
        amount: amountMatch ? parseFloat(amountMatch[1]) : undefined,
        txnId: txnMatch ? txnMatch[1] : undefined,
    };
};
const validateBkashPayment = (sms, expectedAmount, expectedTxnId, MSISDN) => {
    const parsed = parseCashOutSMS(sms);
    if (MSISDN !== "bKash") {
        return false;
    }
    if (!parsed.amount || !parsed.txnId)
        return false;
    return (parsed.amount === expectedAmount &&
        parsed.txnId.toUpperCase() === expectedTxnId.toUpperCase());
};
exports.validateBkashPayment = validateBkashPayment;
