import { useEffect, useState } from "react";
function pickHex(color1, color2, weight) {
  var w1 = weight;
  var w2 = (1 - w1) * 1.4;
  var rgb = [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
  return rgb;
}
const green = [30, 205, 19];
const white = [255, 255, 255];
const red = [205, 30, 19];

function TPLines() {
  const [data, setData] = useState();
  useEffect(() => {
    var W3CWebSocket = require("websocket").w3cwebsocket;

    var client = new W3CWebSocket("ws://103.102.46.93:8080/", "echo-protocol");

    client.onerror = function () {
      console.log("Connection Error");
    };

    client.onopen = function () {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = function (e) {
      if (typeof e.data === "string") {
        setData(JSON.parse(e.data));
      }
    };

    return () => {
      client.onclose = function () {
        console.log("echo-protocol Client Closed");
      };
    };
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Short/TP Long</th>
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.aL.map((item, index) => {
              let maxAsk = data.aS.m[1];
              let backgroundColor = (backgroundColor = pickHex(
                red,
                white,
                item[1] / maxAsk
              ));
              backgroundColor = `rgba(${backgroundColor.join(",")})`;

              return (
                <tr style={{ backgroundColor }} key={index}>
                  <td>{item[0]}</td>
                  <td>{item[2]}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {data && (
        <table border={1}>
          <tbody>
            <tr>
              <td>Ask</td>
              <td>{data.fR.ask[1]}</td>
              <td>{data.fR.ask[0]}</td>
            </tr>
            <tr>
              <td>Bid</td>
              <td>{data.fR.bid[1]}</td>
              <td>{data.fR.bid[0]}</td>
            </tr>
          </tbody>
        </table>
      )}
      <table>
        <thead>
          <tr>
            <th>Long/TP Short</th>
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.bL.map((item, index) => {
              let maxBid = data.bS.m[1];
              let backgroundColor = (backgroundColor = pickHex(
                green,
                white,
                item[1] / maxBid
              ));
              backgroundColor = `rgba(${backgroundColor.join(",")})`;

              return (
                <tr style={{ backgroundColor }} key={index}>
                  <td>{item[0]}</td>
                  <td>{item[2]}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default TPLines;
