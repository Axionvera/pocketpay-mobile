import "react-native-get-random-values";
import * as ExpoCrypto from "expo-crypto";
import "text-encoding";
import { Buffer } from "buffer";

global.Buffer = Buffer;

if (
  typeof global.crypto !== "object" ||
  typeof global.crypto.getRandomValues !== "function"
) {
  const cryptoPolyfill = {
    ...(typeof global.crypto === "object" ? global.crypto : null),
    getRandomValues: (array) => ExpoCrypto.getRandomValues(array),
  };
  try {
    Object.defineProperty(global, "crypto", {
      configurable: true,
      enumerable: true,
      value: cryptoPolyfill,
    });
  } catch (e) {
    global.crypto = cryptoPolyfill;
  }
}

console.log(
  "[shim] crypto.getRandomValues installed:",
  typeof global.crypto === "object" &&
    typeof global.crypto.getRandomValues === "function",
);

// Polyfill process for Stellar SDK.
// 'process/browser' avoids Metro treating this as the Node built-in module.
const bProcess = require("process/browser");
if (typeof process === "undefined") {
  global.process = bProcess;
} else {
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

// Polyfill global env
if (!global.process.env) {
  global.process.env = {};
}
global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
