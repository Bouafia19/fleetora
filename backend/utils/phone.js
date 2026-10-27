/**
 * Normalizes Algerian phone numbers to the canonical international E.164 format:
 * +213XXXXXXXXX (9 digits after +213).
 *
 * Handles:
 *  - 0550000003        -> +213550000003
 *  - 550000003         -> +213550000003
 *  - +213550000003     -> +213550000003
 *  - +213 550 00 00 03 -> +213550000003
 *  - +2130550000003    -> +213550000003
 *  - 00213550000003    -> +213550000003
 *  - 002130550000003   -> +213550000003
 */
function normalizePhone(raw) {
  if (!raw) return raw
  let cleaned = String(raw).replace(/[\s\-\(\)\.]/g, '')

  if (cleaned.startsWith('00213')) {
    cleaned = cleaned.slice(5)
  } else if (cleaned.startsWith('+213')) {
    cleaned = cleaned.slice(4)
  } else if (cleaned.startsWith('213') && cleaned.length > 9) {
    cleaned = cleaned.slice(3)
  }

  // Remove leading 0 if present (e.g. 0550... -> 550...)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }

  // Only prefix if we have digits left
  if (cleaned.length > 0) {
    return '+213' + cleaned
  }
  return raw
}

/**
 * Returns alternative Algerian format with leading zero (+2130XXXXXXXXX)
 * used for backward compatibility with historical records.
 */
function getPhoneWithZero(normalized) {
  if (!normalized || !normalized.startsWith('+213')) return normalized
  if (normalized.startsWith('+2130')) return normalized
  return '+2130' + normalized.slice(4)
}

module.exports = {
  normalizePhone,
  getPhoneWithZero
}
