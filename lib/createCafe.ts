export async function createCafe(
  token: string,
  cafeName: string,
  venmoUsername: string,
  logoFile: File | null,
): Promise<{ slug: string }> {
  let logoUrl = '';
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
      logoUrl = data.logoUrl || '';
    }
  }

  const cafeRes = await fetch('/api/cafe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: cafeName.trim(), venmoUsername: venmoUsername.trim(), logoUrl }),
  });

  if (!cafeRes.ok) {
    const err = await cafeRes.json();
    throw new Error(err.error || 'Failed to create cafe');
  }

  return cafeRes.json();
}
