/**
 * The 36 states plus the FCT.
 *
 * Kept in step with server/WebStore/utils/nigeria.util.js by hand — the storefront
 * and the API are separate deployments with no shared package. This copy renders the
 * dropdown; that copy decides what the API will accept. If a spelling changes in one
 * it must change in the other, or customers pick a state the server then rejects.
 */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

/**
 * Matches a saved value to the canonical spelling. Profiles saved before the state
 * became a dropdown hold free text, so a stored "lagos" still needs to preselect
 * Lagos rather than showing the customer an empty field.
 */
export const canonicalState = (value: string | undefined | null): string => {
  if (!value) return "";
  const needle = value.trim().toLowerCase();
  return NIGERIAN_STATES.find((state) => state.toLowerCase() === needle) ?? "";
};
