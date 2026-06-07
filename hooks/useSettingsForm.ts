import { useState, useEffect } from 'react';
import { CafeConfig } from '@/types';

const MAX_CUSTOM_MSG = 500;

export function useSettingsForm(
  slug: string,
  cafe: CafeConfig | null,
  getIdToken: () => Promise<string | null>,
  updateCafe: (partial: Partial<CafeConfig>) => void,
) {
  const [cafeName, setCafeName] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [hasTwilioCreds, setHasTwilioCreds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cafe) {
      setCafeName(cafe.name);
      setVenmoUsername(cafe.venmoUsername);
      setCustomSmsMessage(cafe.customSmsMessage ?? '');
      setAccentColor(cafe.accentColor ?? '');
      setTipsEnabled(cafe.tipsEnabled ?? true);
      setHasTwilioCreds(cafe.hasTwilioCreds ?? false);
    }
  }, [cafe]);

  const handleSave = async (e: React.FormEvent, logoFile: File | null, currentLogoUrl: string) => {
    e.preventDefault();
    if (!cafeName.trim() || !venmoUsername.trim()) {
      setError('Cafe name and Venmo username are required');
      return;
    }
    if (customSmsMessage.length > MAX_CUSTOM_MSG) {
      setError(`Custom message must be ${MAX_CUSTOM_MSG} characters or fewer`);
      return;
    }
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      const token = await getIdToken();

      let logoUrl = currentLogoUrl;
      if (logoFile) {
        const base64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.onerror = () => rej(new Error('Failed to read file'));
          reader.readAsDataURL(logoFile);
        });
        const uploadRes = await fetch('/api/logo-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ base64Data: base64, filename: logoFile.name, mimeType: logoFile.type }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          logoUrl = data.logoUrl || logoUrl;
        }
      }

      const twilioUpdate: Record<string, string> = {};
      const sidVal = twilioSid.trim();
      const tokenVal = twilioToken.trim();
      const phoneVal = twilioPhone.trim();
      if (sidVal || tokenVal || phoneVal) {
        if (!sidVal || !tokenVal || !phoneVal) {
          setError('To save SMS credentials, all three fields (Account SID, Auth Token, Phone Number) are required');
          setIsSaving(false);
          return;
        }
        twilioUpdate.twilioAccountSid = sidVal;
        twilioUpdate.twilioAuthToken = tokenVal;
        twilioUpdate.twilioPhoneNumber = phoneVal;
      }

      const res = await fetch('/api/cafe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: cafeName.trim(),
          venmoUsername: venmoUsername.trim(),
          logoUrl,
          customSmsMessage: customSmsMessage.trim(),
          accentColor: accentColor.trim(),
          tipsEnabled,
          ...twilioUpdate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save settings');
      }

      updateCafe({
        name: cafeName.trim(),
        venmoUsername: venmoUsername.trim(),
        logoUrl,
        customSmsMessage: customSmsMessage.trim(),
        accentColor: accentColor.trim(),
        tipsEnabled,
      });
      setSuccess(true);
      if (twilioUpdate.twilioAccountSid) {
        setTwilioSid('');
        setTwilioToken('');
        setTwilioPhone('');
        setHasTwilioCreds(true);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const charsLeft = MAX_CUSTOM_MSG - customSmsMessage.length;

  return {
    cafeName, setCafeName,
    venmoUsername, setVenmoUsername,
    customSmsMessage, setCustomSmsMessage,
    accentColor, setAccentColor,
    tipsEnabled, setTipsEnabled,
    twilioSid, setTwilioSid,
    twilioToken, setTwilioToken,
    twilioPhone, setTwilioPhone,
    hasTwilioCreds,
    isSaving,
    success,
    error,
    charsLeft,
    maxCustomMsg: MAX_CUSTOM_MSG,
    handleSave,
  };
}
