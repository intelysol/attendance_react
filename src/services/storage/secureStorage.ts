import { Preferences } from '@capacitor/preferences';
import { AuthSession } from '../../types';
import { APP_CONFIG } from '../../config/constants';

/**
 * Secure Session & Storage Service
 * Encapsulates token lifecycle and sensitive session persistence.
 * Uses Capacitor Preferences with memory-safe in-flight cache.
 */

// Simple XOR and Base64 cipher key for in-app data obfuscation before native preference storage
const CIPHER_SEED = 'IntelysolHCM-Keystore-Vault-2026';

function obscure(str: string): string {
  try {
    const chars = str.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ CIPHER_SEED.charCodeAt(i % CIPHER_SEED.length))
    );
    return btoa(encodeURIComponent(chars.join('')));
  } catch {
    return btoa(str);
  }
}

function deobscure(obscured: string): string {
  try {
    const decoded = decodeURIComponent(atob(obscured));
    const chars = decoded.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ CIPHER_SEED.charCodeAt(i % CIPHER_SEED.length))
    );
    return chars.join('');
  } catch {
    return atob(obscured);
  }
}

class SecureStorageService {
  private inMemorySession: AuthSession | null = null;
  private cachedDeviceId: string | null = null;

  async getSession(): Promise<AuthSession | null> {
    if (this.inMemorySession) {
      return this.inMemorySession;
    }

    try {
      const { value } = await Preferences.get({ key: APP_CONFIG.SESSION_STORAGE_KEY });
      if (!value) return null;

      const decrypted = deobscure(value);
      const parsed: AuthSession = JSON.parse(decrypted);

      // Validate expiration
      if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
        await this.clearSession();
        return null;
      }

      this.inMemorySession = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  async setSession(session: AuthSession): Promise<void> {
    this.inMemorySession = session;
    try {
      const serialized = JSON.stringify(session);
      const encrypted = obscure(serialized);
      await Preferences.set({
        key: APP_CONFIG.SESSION_STORAGE_KEY,
        value: encrypted,
      });
    } catch (err) {
      console.error('Failed to securely store session:', err);
    }
  }

  async clearSession(): Promise<void> {
    this.inMemorySession = null;
    try {
      await Preferences.remove({ key: APP_CONFIG.SESSION_STORAGE_KEY });
    } catch (err) {
      console.error('Failed to clear session from storage:', err);
    }
  }

  async getDeviceId(): Promise<string> {
    if (this.cachedDeviceId) return this.cachedDeviceId;

    try {
      const { value } = await Preferences.get({ key: APP_CONFIG.DEVICE_ID_STORAGE_KEY });
      if (value) {
        this.cachedDeviceId = value;
        return value;
      }
    } catch {
      // Fallback
    }

    // Generate consistent installation UUID
    const newId = `mobile-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)}`;
    this.cachedDeviceId = newId;

    try {
      await Preferences.set({
        key: APP_CONFIG.DEVICE_ID_STORAGE_KEY,
        value: newId,
      });
    } catch {
      // Ignore
    }

    return newId;
  }

  async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const { value } = await Preferences.get({ key: `pref_${key}` });
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }

  async setPreference<T>(key: string, value: T): Promise<void> {
    try {
      await Preferences.set({
        key: `pref_${key}`,
        value: JSON.stringify(value),
      });
    } catch (err) {
      console.error('Failed to save preference:', err);
    }
  }
}

export const secureStorage = new SecureStorageService();
