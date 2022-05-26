import { useState, useEffect, useRef } from "react";
import { fetchKline } from "../utils/functions";
import dynamic from "next/dynamic";
import TPLines from "../components/TPLines";
const ChartComponent = dynamic(() => import("../components/TradingView.js"), {
  ssr: false,
});
const intervals = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
];
function IndexPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("30m");
  const handleInterval = (i) => {
    setInterval(i);
  };
  const [klines, setKlines] = useState([]);
  useEffect(() => {
    fetchKline(symbol, interval).then((r) => setKlines(r));

    return () => {};
  }, [interval]);

  return klines.length ? (
    <div>
      <ChartComponent
        symbol={symbol}
        interval={interval}
        intervals={intervals}
        handleInterval={handleInterval}
        klines={klines}
      ></ChartComponent>{" "}
      <TPLines></TPLines>
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default IndexPage;
