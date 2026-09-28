export interface Contact {
  address?: string | null;
  phone?: string | null;
  phoneUrl?: string | null;
  email?: string | null;
}

export function phoneHref(contact: Contact): string {
  return contact.phoneUrl || `tel:${(contact.phone || "").replace(/\s+/g, "")}`;
}
