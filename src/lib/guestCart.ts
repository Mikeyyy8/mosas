/**
 * The signed-out cart, kept in localStorage.
 *
 * Only product ids and quantities are stored. Names, images and prices are fetched
 * fresh from the catalogue on every render, so a cart left open for a week shows
 * today's prices rather than a stale copy — and the server re-prices everything again
 * at checkout regardless, so nothing here can decide what anyone pays.
 */
const KEY = "mosas.guestCart.v1";

export interface GuestCartLine {
  productId: string;
  quantity: number;
}

export const MAX_QUANTITY = 99;

/**
 * localStorage throws in Safari private mode and when a browser blocks site data,
 * and a shopper hitting that should get an empty cart rather than a blank page.
 */
const safeRead = (): GuestCartLine[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line): line is GuestCartLine =>
          typeof line?.productId === "string" && Number.isFinite(line?.quantity)
      )
      .map((line) => ({
        productId: line.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(line.quantity))),
      }));
  } catch {
    return [];
  }
};

const safeWrite = (lines: GuestCartLine[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Out of quota or storage disabled. The in-memory cart still works for this
    // visit; it just will not survive a reload.
  }
};

export const readGuestCart = safeRead;

export const writeGuestCart = safeWrite;

export const clearGuestCart = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do — see safeWrite */
  }
};

export const addGuestLine = (productId: string, quantity = 1): GuestCartLine[] => {
  const lines = safeRead();
  const existing = lines.find((line) => line.productId === productId);

  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
  } else {
    lines.push({ productId, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) });
  }

  safeWrite(lines);
  return lines;
};

export const setGuestQuantity = (productId: string, quantity: number): GuestCartLine[] => {
  const lines = safeRead().flatMap((line) => {
    if (line.productId !== productId) return [line];
    const next = Math.min(MAX_QUANTITY, Math.floor(quantity));
    return next < 1 ? [] : [{ ...line, quantity: next }];
  });

  safeWrite(lines);
  return lines;
};

export const removeGuestLine = (productId: string): GuestCartLine[] => {
  const lines = safeRead().filter((line) => line.productId !== productId);
  safeWrite(lines);
  return lines;
};
