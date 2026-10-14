export interface ParsedNLPResult {
  type: 'expense' | 'task';
  amount?: number;
  category?: string;
  desc?: string;
  text?: string;
  priority?: 'high' | 'medium' | 'low';
  summary: string;
}

export function convertBengaliDigits(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, d => String(bnDigits.indexOf(d)));
}

export function parseNaturalLanguage(rawText: string, currency = '৳'): ParsedNLPResult | null {
  if (!rawText || !rawText.trim()) return null;
  const text = convertBengaliDigits(rawText.trim());
  const lower = text.toLowerCase();

  // Extract amount: e.g. 350, ৳350, 350tk, 350 টাকা
  const amtMatch = text.match(/(?:[৳\$€£]|\b(?:tk|taka|bdt)\b)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:[৳\$€£]|\b(?:tk|taka|bdt|টাকা)\b)?/i);
  const amount = amtMatch ? parseFloat(amtMatch[1]) : null;

  // Task keywords
  const taskKeywords = ['meeting', 'মিটিং', 'call', 'কল', 'study', 'পড়া', 'assignment', 'send', 'পাঠানো', 'review', 'fix', 'finish', 'doctor', 'ডাক্তার', 'task', 'কাজ', 'buy', 'কেনা'];
  const hasTaskWord = taskKeywords.some(k => lower.includes(k));
  const hasExpenseWord = ['খেলাম', 'খাইলাম', 'বিল', 'ভাড়া', 'খরচ', 'কাচ্চি', 'বিরিয়ানি', 'বাজার', 'টাকা', 'lunch', 'dinner', 'bill', 'fare', 'cost', 'expense', 'bdt', 'tk'].some(k => lower.includes(k));

  if (hasTaskWord && !hasExpenseWord) {
    return {
      type: 'task',
      text: rawText.trim(),
      priority: lower.includes('urgent') || lower.includes('জরুরি') ? 'high' : 'medium',
      summary: `✓ Priority Task: "${rawText.trim()}"`
    };
  }

  // Expense Categories
  const categories: Record<string, string[]> = {
    'Food': ['কাচ্চি', 'বিরিয়ানি', 'খাবার', 'খাইলাম', 'খেলাম', 'লাঞ্চ', 'ডিনার', 'নাস্তা', 'চা', 'কফি', 'lunch', 'dinner', 'breakfast', 'coffee', 'tea', 'burger', 'pizza', 'restaurant'],
    'Transportation': ['রিকশা', 'উবার', 'পাঠাও', 'বাস', 'ভাড়া', 'তেল', 'সিএনজি', 'uber', 'pathao', 'rickshaw', 'bus', 'train', 'metro', 'fare', 'fuel', 'petrol'],
    'Groceries': ['বাজার', 'মুদি', 'চাল', 'ডাল', 'সবজি', 'মাছ', 'মাংস', 'grocery', 'bazaar', 'supermarket', 'fruits', 'veggies'],
    'Utilities': ['বিদ্যুৎ', 'কারেন্ট', 'ওয়াইফাই', 'নেট', 'গ্যাস', 'পানি', 'বিল', 'bill', 'wifi', 'internet', 'electricity', 'utility'],
    'Healthcare': ['ঔষধ', 'ওষুধ', 'ডাক্তার', 'মেডিসিন', 'টেস্ট', 'hospital', 'medicine', 'pharma'],
    'Entertainment': ['সিনেমা', 'মুভি', 'ঘোরাঘুরি', 'movie', 'game', 'fun']
  };

  let detectedCat = 'Other';
  for (const [cat, kws] of Object.entries(categories)) {
    if (kws.some(k => lower.includes(k))) {
      detectedCat = cat;
      break;
    }
  }

  if (amount !== null && amount > 0) {
    return {
      type: 'expense',
      amount,
      category: detectedCat,
      desc: rawText.trim(),
      summary: `💸 Expense: ${currency} ${amount.toLocaleString()} (${detectedCat})`
    };
  }

  return {
    type: 'task',
    text: rawText.trim(),
    priority: 'medium',
    summary: `✓ Priority Task: "${rawText.trim()}"`
  };
}
