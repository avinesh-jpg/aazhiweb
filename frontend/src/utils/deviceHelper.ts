// src/utils/deviceHelper.ts

/**
 * Detects a human-readable default device label from the browser User Agent
 */
export const getDefaultDeviceLabel = (): string => {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return 'Staff Laptop';
  }

  const ua = navigator.userAgent;

  if (/windows/i.test(ua)) {
    return 'Windows Laptop';
  }
  if (/macintosh|mac os x/i.test(ua)) {
    return 'MacBook';
  }
  if (/ipad/i.test(ua)) {
    return 'iPad Tablet';
  }
  if (/iphone/i.test(ua)) {
    return 'iPhone';
  }
  if (/android/i.test(ua)) {
    return 'Android Device';
  }
  if (/linux/i.test(ua)) {
    return 'Linux PC';
  }

  return 'Store Laptop';
};

/**
 * Returns the configured device nickname for this laptop/phone,
 * falling back to the detected OS device label.
 */
export const getDeviceName = (): string => {
  if (typeof window === 'undefined') return 'Store Laptop';
  
  const saved = localStorage.getItem('aazhi_admin_device_name');
  if (saved && saved.trim()) {
    return saved.trim();
  }

  const defaultLabel = getDefaultDeviceLabel();
  return defaultLabel;
};

/**
 * Persists a new device nickname (e.g. "Billing Laptop 1", "Packing Table PC")
 */
export const setDeviceName = (name: string): void => {
  if (typeof window === 'undefined') return;
  const clean = name.trim();
  if (clean) {
    localStorage.setItem('aazhi_admin_device_name', clean);
    localStorage.setItem('aazhi_admin_device_prompted', 'true');
  }
};

/**
 * Checks if the user has been asked to name their laptop on this browser
 */
export const hasPromptedDeviceName = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('aazhi_admin_device_prompted') === 'true';
};

/**
 * Marks that the device has been prompted or dismissed
 */
export const markDevicePrompted = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('aazhi_admin_device_prompted', 'true');
};
