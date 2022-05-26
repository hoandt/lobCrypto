import {
  createChart,
  CrosshairMode,
  PriceScaleMode,
  LineStyle,
} from "lightweight-charts";
const W3CWebSocket = require("websocket").w3cwebsocket;

import { useState, useEffect, useRef } from "react";

const BINANE_FAPI_WS = "wss://fstream.binance.com/";

const chartOptions = {
  with: 500,
  height: 500,
  watermark: {
    visible: true,
    fontSize: 32,
    horzAlign: "left",
    vertAlign: "top",
    color: "rgba(90, 129, 90, 0.2)",
    text: "@ElMex24",
  },
  layout: {
    textColor: "black",
    background: { type: "solid", color: "white" },
  },

  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: {
      color: "#626c73",
      width: 0.5,
      style: LineStyle.LargeDashed,
      visible: true,
      labelVisible: true,
    },
    horzLine: {
      color: "#626c73",
      width: 0.5,
      style: LineStyle.LargeDashed,
      visible: true,
      labelVisible: true,
    },
  },
  priceScale: {
    mode: PriceScaleMode.Logarithmic,
    borderColor: "#474d57",
    autoScale: true,
    invertScale: false,
  },
  // layout: {
  //   backgroundColor: "#1b1d23",
  //   textColor: "#fff",
  // },
  grid: {
    horzLines: {
      color: "#efefef",
    },
    vertLines: {
      color: "#efefef",
    },
  },
  handleScroll: {
    // vertTouchDrag: false,
  },
  // localization: {
  //   timeFormatter: timeFormatter,
  // },
  localization: {
    locale: "en-US",
  },
};
const candleStickOptions = {
  upColor: "#2ebd85",
  downColor: "#e0294a",
  wickUpColor: "#336854",
  wickDownColor: "#7f323f",
  wickVisible: true,
  borderVisible: true,
};

const ChartComponent = ({
  klines,
  intervals,
  symbol,
  interval,
  handleInterval,
}) => {
  const [legend, setLegend] = useState();

  const seriesRef = useRef();
  const [orderBookLines, setOrderBookLines] = useState({
    ask: [
      {
        price: 32000,
        color: "red",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: "min",
      },
      {
        price: 31600,
        color: "red",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        // title: "min",
      },
      {
        price: 31000,
        color: "red",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        // title: "min",
      },
    ],
    bid: [
      {
        price: 29000,
        color: "green",
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: "max",
      },
      {
        price: 29500,
        color: "green",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: "29500",
      },
    ],
  });
  const [lines, setLines] = useState({});
  const chartContainerRef = useRef();

  const removeLine = () => {
    Object.keys(lines).map(
      (side) =>
        Object.keys(lines[side]).map((l) =>
          seriesRef.current.removePriceLine(lines[side][l])
        )

      // lines[side].map((l) => seriesRef.current.removePriceLine(l))
    );
  };

  useEffect(() => {
    //Step 1: Intantiate Chart
    if (chartContainerRef.current.childNodes.length > 0) {
      chartContainerRef.current.removeChild(
        chartContainerRef.current.children[0]
      ); //remove previous rendered chart
    }

    const visibleRange = {
      from: klines.length - 50,
      to: klines.length + 30,
    };
    let ohlcData = [];

    for (const v of klines) {
      const time = v[0] / 1000;
      const open = parseFloat(v[1]);
      const high = parseFloat(v[2]);
      const low = parseFloat(v[3]);
      const close = parseFloat(v[4]);

      ohlcData.push({
        time,
        open,
        high,
        low,
        close,
      });
    }

    const chart = createChart(chartContainerRef.current, chartOptions);
    //Step 2: Intantiate CandleStick Series
    const candleSeries = chart.addCandlestickSeries(candleStickOptions);
    //Step 3: Set Data to chart

    candleSeries.setData(ohlcData);

    /**Optional */

    //hover legend
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        let ohlc = param.seriesPrices.get(candleSeries);
        setLegend(ohlc);
      } else {
      }
    });
    //PreZoom
    const { from, to } = visibleRange;
    chart.timeScale().setVisibleLogicalRange({
      from,
      to,
    });

    seriesRef.current = candleSeries;

    //**update websocket */
    const klinesClient = new W3CWebSocket(
      `${BINANE_FAPI_WS}/ws/${symbol.toLowerCase()}@kline_${interval}`
    );

    klinesClient.onerror = function () {
      console.log("Connection Error");
    };

    klinesClient.onopen = function () {
      console.log(symbol + "open");
    };

    klinesClient.onmessage = async (e) => {
      const { k } = JSON.parse(e.data);
      const { c, t, h, l, v, o } = k;

      //setup update candle
      let updateOHLC = {};

      const time = t / 1000;
      const open = parseFloat(o);
      const high = parseFloat(h);
      const low = parseFloat(l);
      const close = parseFloat(c);
      const value = parseFloat(v); //volume
      const color =
        open > close ? "rgba(255,82,82, 0.5)" : "rgba(0, 150, 136, 0.5)";

      updateOHLC = {
        time,
        open,
        high,
        low,
        close,
      };

      candleSeries.update(updateOHLC);
    };
    return () => {
      klinesClient.onclose = function () {};
    };
  }, [klines]);

  useEffect(() => {
    let candleSeries = seriesRef.current;
    orderBookLines.bid.map((line, i) => {
      setLines((prev) => {
        return {
          ...prev,
          bid: { ...prev.bid, [i]: candleSeries.createPriceLine(line) },
        };
      });
    });
    orderBookLines.ask.map((line, i) => {
      setLines((prev) => {
        console.log("[components/TradingView.js]: ", i);
        return {
          ...prev,
          ask: { ...prev.ask, [i]: candleSeries.createPriceLine(line) },
        };
      });
    });

    return () => {};
  }, [klines]);

  //OUTPUT
  return (
    <div>
      <div ref={chartContainerRef}></div>
      {legend && (
        <div>
          O: {legend.open} C: {legend.close} H: {legend.high} L: {legend.low}
        </div>
      )}

      <div>
        {intervals.map((interval) => (
          <button key={interval} onClick={() => handleInterval(interval)}>
            {interval}
          </button>
        ))}
        <button onClick={() => removeLine(seriesRef)}>Remove line</button>
      </div>
    </div>
  );
};

export default ChartComponent;
