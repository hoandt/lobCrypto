export const fetchKline = async (symbol, interval) => {
  try {
    const url = new URL("https://api.binance.com/api/v3/klines");
    const params = { symbol: symbol.toUpperCase(), interval: interval };
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
    const response = await fetch(url.toString(), {
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("error:", error);
    return error;
  }
};
export const timeFormatter = (timestamp) => {
  const date = new Date(timestamp);
  const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "numeric",
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

  return dateFormatter.format(date);
};
