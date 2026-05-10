/**
 * SMS Parser for Indian Banks & UPI apps
 * Supports: HDFC, ICICI, SBI, Axis, Kotak, Yes Bank, PNB, BOB
 *           GPay, PhonePe, Paytm, Amazon Pay, CRED
 *           All major Credit Cards
 */

export const CATEGORIES = {
  FOOD: { name: 'Food & Dining', icon: '🍽️', color: '#F97316' },
  SHOPPING: { name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
  TRANSPORT: { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  ENTERTAINMENT: { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
  HEALTH: { name: 'Health', icon: '🏥', color: '#10B981' },
  UTILITIES: { name: 'Utilities', icon: '💡', color: '#F59E0B' },
  EDUCATION: { name: 'Education', icon: '📚', color: '#6366F1' },
  TRAVEL: { name: 'Travel', icon: '✈️', color: '#14B8A6' },
  GROCERY: { name: 'Grocery', icon: '🛒', color: '#84CC16' },
  INVESTMENT: { name: 'Investment', icon: '📈', color: '#0EA5E9' },
  TRANSFER: { name: 'Transfer', icon: '💸', color: '#6B7280' },
  OTHER: { name: 'Other', icon: '📦', color: '#9CA3AF' },
};

// Senders that are financial institutions
const BANK_SENDERS = [
  'HDFCBK', 'ICICIT', 'SBIINB', 'AXISBK', 'KOTAKB', 'YESBNK',
  'PNBSMS', 'BOBTXN', 'CANBNK', 'UNIONB', 'INDBNK', 'CENTBK',
  'PAYTMB', 'GPAY', 'PHONEPE', 'AMAZONPAY', 'CRED',
  'AMEXIN', 'SCBNK', 'CITIBNK', 'HSBCIN', 'RBLBNK',
  'JD', 'VM', 'AD', 'BP', // Short sender codes
];

// Regex patterns to extract transaction details
const PATTERNS = {
  // Debit patterns
  debited: [
    /(?:debited|debit(?:ed)?|spent|paid|withdrawn?|payment of)\s*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been\s*)?(?:debited|deducted|spent|paid)/i,
    /(?:rs\.?|inr|₹)([\d,]+(?:\.\d{1,2})?)\s*(?:is\s*)?(?:debited|deducted)/i,
    /(?:sent|transferred?)\s*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /purchase\s*of\s*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /txn\s*(?:of|for|amt)?\s*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  ],

  // Credit patterns
  credited: [
    /(?:credited|credit(?:ed)?|received|refund(?:ed)?)\s*(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been\s*)?(?:credited|received|refunded)/i,
    /(?:rs\.?|inr|₹)([\d,]+(?:\.\d{1,2})?)\s*(?:is\s*)?(?:credited|received)/i,
  ],

  // Balance patterns
  balance: [
    /(?:avl\.?\s*bal\.?|available\s*balance|a\/c\s*bal\.?|balance)\s*(?:is\s*)?(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /bal(?:ance)?\s*:?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ],

  // Merchant / payee patterns
  merchant: [
    /at\s+([A-Z][A-Za-z0-9\s\-&.']{2,40})(?:\s+on|\s+via|\s*\.|\s*;|\s*-)/i,
    /to\s+([A-Z][A-Za-z0-9\s\-&.']{2,40})(?:\s+on|\s+via|\s*\.|\s*;|\s*-)/i,
    /(?:merchant|payee|to\s+vpa)\s*:?\s*([A-Za-z0-9\s\-&.'@]{3,50})/i,
    /upi\s*:?\s*([A-Za-z0-9._-]+@[A-Za-z0-9._-]+)/i,
    /(?:via|using)\s+(gpay|phonepe|paytm|bhim|amazon\s*pay)/i,
  ],

  // Reference/transaction ID
  refId: [
    /(?:ref\s*(?:no\.?|id|number)?|txn\s*(?:id|no\.?)|transaction\s*(?:id|no\.?)|utr)\s*:?\s*([A-Z0-9]{8,20})/i,
    /\b([0-9]{12,18})\b/,
  ],

  // Date patterns
  date: [
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
  ],
};

// Category keyword mapping
const CATEGORY_KEYWORDS = {
  FOOD: ['swiggy', 'zomato', 'restaurant', 'cafe', 'dominos', 'mcdonalds', 'kfc', 'pizza', 'biryani', 'hotel', 'dining', 'eatery', 'food', 'burger', 'subway', 'starbucks'],
  SHOPPING: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'snapdeal', 'shopify', 'shop', 'mall', 'store', 'market', 'purchase', 'buy', 'retail'],
  TRANSPORT: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'petrol', 'fuel', 'diesel', 'cab', 'auto', 'parking', 'fastag', 'toll', 'redbus', 'bus'],
  ENTERTAINMENT: ['netflix', 'hotstar', 'prime', 'spotify', 'youtube', 'bookmyshow', 'pvr', 'inox', 'movie', 'cinema', 'gaming', 'steam', 'jio'],
  HEALTH: ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'medicine', 'apollo', 'netmeds', 'pharmeasy', '1mg', 'health', 'lab', 'diagnostic'],
  UTILITIES: ['electricity', 'water', 'gas', 'bses', 'bescom', 'mseb', 'airtel', 'vodafone', 'jio', 'bsnl', 'broadband', 'internet', 'recharge', 'bill', 'utility'],
  EDUCATION: ['school', 'college', 'university', 'coursera', 'udemy', 'byju', 'unacademy', 'vedantu', 'tuition', 'education', 'fees', 'book'],
  TRAVEL: ['makemytrip', 'goibibo', 'yatra', 'airbnb', 'oyo', 'hotel', 'flight', 'airline', 'indigo', 'spicejet', 'air india', 'cleartrip'],
  GROCERY: ['bigbasket', 'blinkit', 'dunzo', 'grofers', 'dmart', 'reliance fresh', 'more supermarket', 'grocery', 'vegetables', 'milk', 'zepto'],
  INVESTMENT: ['zerodha', 'groww', 'upstox', 'angel', 'mf', 'mutual fund', 'sip', 'stock', 'share', 'nse', 'bse', 'ipo', 'fd', 'fixed deposit', 'ppf'],
};

/**
 * Detect if an SMS is a financial transaction
 */
export function isTransactionSMS(sms) {
  const body = (sms.body || '').toLowerCase();
  const sender = (sms.address || '').toUpperCase();

  // Check if sender is a known bank
  const isBankSender = BANK_SENDERS.some(b => sender.includes(b));

  // Check for financial keywords
  const hasFinancialKeywords = /(?:debited|credited|payment|transaction|txn|spent|received|transfer|balance|rs\.|inr|₹|\bupi\b|\bneft\b|\bimps\b|\brtgs\b)/i.test(body);

  // Check for amount pattern
  const hasAmount = /(?:rs\.?|inr|₹)\s*[\d,]+(?:\.\d{1,2})?/i.test(body);

  return (isBankSender || hasFinancialKeywords) && hasAmount;
}

/**
 * Extract amount from SMS
 */
function extractAmount(body) {
  // Try debit patterns first
  for (const pattern of PATTERNS.debited) {
    const match = body.match(pattern);
    if (match) {
      return {
        amount: parseFloat(match[1].replace(/,/g, '')),
        type: 'debit',
      };
    }
  }

  // Try credit patterns
  for (const pattern of PATTERNS.credited) {
    const match = body.match(pattern);
    if (match) {
      return {
        amount: parseFloat(match[1].replace(/,/g, '')),
        type: 'credit',
      };
    }
  }

  // Generic amount extraction — check for "debit" or "credit" words
  const amountMatch = body.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    const type = /debit|spent|paid|withdrawn|sent/i.test(body) ? 'debit' : 'credit';
    return {
      amount: parseFloat(amountMatch[1].replace(/,/g, '')),
      type,
    };
  }

  return null;
}

/**
 * Extract merchant name from SMS
 */
function extractMerchant(body) {
  for (const pattern of PATTERNS.merchant) {
    const match = body.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  return null;
}

/**
 * Extract balance from SMS
 */
function extractBalance(body) {
  for (const pattern of PATTERNS.balance) {
    const match = body.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

/**
 * Extract reference ID
 */
function extractRefId(body) {
  for (const pattern of PATTERNS.refId) {
    const match = body.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Determine category from merchant name or SMS body
 */
function determineCategory(merchant, body) {
  const text = `${merchant || ''} ${body}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }

  return 'OTHER';
}

/**
 * Detect payment method from SMS
 */
function detectPaymentMethod(body, sender) {
  const text = body.toLowerCase();
  const snd = sender.toUpperCase();

  if (/upi|gpay|phonepe|paytm|bhim/i.test(text)) return 'UPI';
  if (/credit\s*card|cc\s*no|creditcard/i.test(text)) return 'Credit Card';
  if (/debit\s*card|dc\s*no|debitcard/i.test(text)) return 'Debit Card';
  if (/neft|rtgs|imps/i.test(text)) return 'Bank Transfer';
  if (/atm|cash/i.test(text)) return 'ATM/Cash';
  if (snd.includes('PAYTM')) return 'Paytm';
  if (snd.includes('PHONEPE') || text.includes('phonepe')) return 'PhonePe';
  if (snd.includes('GPAY') || text.includes('google pay')) return 'GPay';

  return 'Other';
}

/**
 * Main parser - converts raw SMS to transaction object
 */
export function parseSMS(sms) {
  const body = sms.body || '';
  const sender = sms.address || '';

  if (!isTransactionSMS(sms)) return null;

  const amountData = extractAmount(body);
  if (!amountData) return null;

  const merchant = extractMerchant(body);
  const category = determineCategory(merchant, body);
  const balance = extractBalance(body);
  const refId = extractRefId(body);
  const paymentMethod = detectPaymentMethod(body, sender);

  // Extract bank name from sender
  let bank = 'Unknown Bank';
  if (sender.includes('HDFC')) bank = 'HDFC Bank';
  else if (sender.includes('ICICI')) bank = 'ICICI Bank';
  else if (sender.includes('SBI')) bank = 'SBI';
  else if (sender.includes('AXIS')) bank = 'Axis Bank';
  else if (sender.includes('KOTAK')) bank = 'Kotak Bank';
  else if (sender.includes('PAYTM')) bank = 'Paytm';
  else if (sender.includes('PHONEPE')) bank = 'PhonePe';
  else if (sender.includes('GPAY')) bank = 'Google Pay';
  else if (sender.includes('YES')) bank = 'Yes Bank';
  else if (sender.includes('PNB')) bank = 'PNB';

  return {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amountData.amount,
    type: amountData.type, // 'debit' | 'credit'
    merchant: merchant || 'Unknown',
    category,
    bank,
    paymentMethod,
    balance,
    refId,
    date: new Date(sms.date || Date.now()).toISOString(),
    rawSMS: body,
    source: 'sms',
    isManual: false,
  };
}

/**
 * Parse multiple SMS messages, deduplicating by refId
 */
export function parseAllSMS(smsList) {
  const seen = new Set();
  const transactions = [];

  for (const sms of smsList) {
    try {
      const txn = parseSMS(sms);
      if (!txn) continue;

      // Deduplicate by refId
      const dedupeKey = txn.refId || `${txn.amount}_${txn.date}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      transactions.push(txn);
    } catch (e) {
      // Skip malformed SMS
    }
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}
