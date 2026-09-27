interface SubmitResult {
  success: boolean;
  correlativo?: string;
  error?: string;
}

interface SubmitOptions {
  formType: string;
  data: Record<string, string | boolean>;
  files?: Record<string, File[]>;
  honeypot?: string;
  captchaToken?: string;
}

export async function submitForm({ formType, data, files, honeypot, captchaToken }: SubmitOptions): Promise<SubmitResult> {
  const base = import.meta.env.BASE_URL || "/";
  const endpoint = `${base}send-email.php`.replace(/\/\//g, "/");

  const hasFiles = files && Object.values(files).some(arr => arr.length > 0);

  let res: Response;

  if (hasFiles) {
    const formData = new FormData();
    formData.append('formType', formType);
    if (honeypot) formData.append('website', honeypot);
    formData.append('captchaToken', captchaToken || '');

    for (const [key, val] of Object.entries(data)) {
      formData.append(key, String(val));
    }

    for (const [fieldName, fileList] of Object.entries(files!)) {
      for (const file of fileList) {
        formData.append(`${fieldName}[]`, file);
      }
    }

    res = await fetch(endpoint, { method: 'POST', body: formData });
  } else {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, ...data, website: honeypot || '', captchaToken: captchaToken || '' }),
    });
  }

  const result = await res.json();
  return result;
}