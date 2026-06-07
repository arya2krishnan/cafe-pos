import twilio from 'twilio';

export interface TextResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
  if (phoneNumber.startsWith('+')) return phoneNumber.replace(/\s/g, '');
  return cleaned;
}

export interface TwilioCreds {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export async function sendText(
  phoneNumber: string,
  message: string,
  creds?: TwilioCreds,
): Promise<TextResponse> {
  const accountSid = creds?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = creds?.authToken || process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = creds?.phoneNumber || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone || formattedPhone.replace(/\D/g, '').length < 10) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({ body: message, to: formattedPhone, from: fromNumber });
    return { success: true, messageSid: msg.sid };
  } catch (err) {
    console.error('Twilio error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
