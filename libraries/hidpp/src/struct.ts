import Struct from "@yume-chan/struct";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeUtf8(text: string): ArrayBuffer {
  return textEncoder.encode(text);
}

export function decodeUtf8(buffer: ArrayBuffer): string {
  return textDecoder.decode(buffer);
}

export function serialize<T extends Struct>(Type: T, init: T['TInit']): ArrayBuffer {
  return Type.serialize(init, { encodeUtf8 });
}

export function deserialize<T extends Struct<any, any, any, any>>(Type: T, buffer: ArrayBuffer): Promise<T['TDeserializeResult']> {
  let index = 0;
  return Type.deserialize({
    read(length) {
      const result = buffer.slice(index, index + length);
      index += length;
      return result;
    },
    encodeUtf8,
    decodeUtf8,
  });
}
