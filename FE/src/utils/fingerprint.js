export const FINGERPRINT_KEY = 'ceibo_client_fp'

export function getClientFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = `fp_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}
