export const COUNTRIES = [
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'US', name: 'United States', dial: '+1' },
].sort((a, b) => a.name.localeCompare(b.name));

export function getCountry(code) {
  return COUNTRIES.find((country) => country.code === String(code || '').toUpperCase()) || null;
}

export function getDialCode(code) {
  return getCountry(code)?.dial || '';
}

/** Strip a known international dial prefix from a phone string. */
export function stripDialCode(phone = '') {
  const value = String(phone).trim();
  if (!value) return '';
  const match = COUNTRIES
    .map((country) => country.dial)
    .sort((a, b) => b.length - a.length)
    .find((dial) => value === dial || value.startsWith(`${dial} `) || value.startsWith(dial));
  if (!match) return value.replace(/^\+\d+\s*/, '').trim();
  return value.slice(match.length).trim();
}

/** Apply selected country dial code while keeping the local number. */
export function withDialCode(phone = '', countryCode = 'US') {
  const dial = getDialCode(countryCode);
  const local = stripDialCode(phone);
  if (!dial) return local;
  if (!local) return `${dial} `;
  return `${dial} ${local}`;
}

export function countryLabel(code) {
  const country = getCountry(code);
  return country ? `${country.name} (${country.code})` : code || '';
}
