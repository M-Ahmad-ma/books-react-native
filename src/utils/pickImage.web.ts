export async function pickImage(): Promise<string | null> {
  return new Promise((resolve) => {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc) { resolve(null); return; }
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
