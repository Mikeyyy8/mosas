const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// Prices are whole naira in practice — trailing ".00" everywhere just added noise
export const formatPrice = (value: number) => naira.format(Math.round(value));

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
