import Struct from "@yume-chan/struct";

export const HidppPacket =
  new Struct()
    .uint8('deviceIndex')
    .uint8('command');

export type HidppPacket = typeof HidppPacket['TDeserializeResult'];

export function concatArrayBuffers(...args: ArrayBuffer[]) {
  let totalLength = 0;
  for (let i = 0; i < args.length; i++) {
    totalLength += args[i].byteLength;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < args.length; i++) {
    result.set(new Uint8Array(args[i]), offset);
    offset += args[i].byteLength;
  }
  return result.buffer;
}
