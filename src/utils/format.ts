export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
