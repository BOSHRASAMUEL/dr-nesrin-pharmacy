// Local Storage management for site configuration and branding
export interface SiteSettings {
  logoUrl?: string;
  faviconUrl?: string;
  setupCompleted?: boolean;
  repositoryOwner?: string;
  repositoryName?: string;
  gitToken?: string;
  adminPasswordHash?: string; // سيتم حفظ كـ hash
}

const STORAGE_KEY = 'pharmacy_site_settings';

export function loadSiteSettings(): SiteSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save site settings:', err);
  }
}

export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const current = loadSiteSettings();
  const updated = { ...current, ...partial };
  saveSiteSettings(updated);
  return updated;
}

export function clearSiteSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isSetupCompleted(): boolean {
  return loadSiteSettings().setupCompleted ?? false;
}

export function markSetupAsCompleted(): void {
  updateSiteSettings({ setupCompleted: true });
}

// Simple hash function (في الإنتاج استخدم bcrypt أو ما شابه)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // تحويل إلى 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export function saveAdminPassword(password: string): void {
  const hash = simpleHash(password);
  updateSiteSettings({ adminPasswordHash: hash });
}

export function verifyAdminPassword(password: string): boolean {
  const settings = loadSiteSettings();
  if (!settings.adminPasswordHash) return false;
  const hash = simpleHash(password);
  return hash === settings.adminPasswordHash;
}

export function hasAdminPassword(): boolean {
  const settings = loadSiteSettings();
  return !!settings.adminPasswordHash;
}
