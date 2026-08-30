/**
 * The store's own contact details, in one place.
 *
 * The phone number used to be written out twice — a US placeholder in the footer
 * and a different placeholder in the WhatsApp button — so the two could never
 * agree and neither reached the shop. It now comes from the environment, and any
 * surface that shows it hides itself when it isn't set. A missing phone number is
 * better than a wrong one: a customer who dials a stranger doesn't come back.
 */

export const storeEmail = "hello@mosas.com";

export const storeAddress = "Omonile bus stop, Old Akute Road, Obawole, Lagos";

/** Full international form, e.g. +234 801 234 5678. Blank until configured. */
export const storePhone = (import.meta.env.VITE_STORE_PHONE ?? "").trim();

/** Digits only, which is what both tel: and wa.me want. */
const dialable = storePhone.replace(/\D/g, "");

export const storePhoneHref = dialable ? `tel:+${dialable}` : null;

export const whatsappHref = dialable
  ? `https://wa.me/${dialable}?text=${encodeURIComponent(
      "Hi MOSAS — I have a question about an order.",
    )}`
  : null;
