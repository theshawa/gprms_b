import { Currency } from "../constants";

const formatter = Intl.NumberFormat("default", {
  style: "currency",
  currency: Currency,
});

export const formatCurrency = (amount: number): string => {
  return formatter.format(amount);
};
