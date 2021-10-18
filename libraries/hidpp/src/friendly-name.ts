import { Hidpp } from "./hidpp";

const textDecoder = new TextDecoder();

export class FriendlyName {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getFriendlyNameLength(): Promise<{ nameLength: number; nameMaxLength: number; defaultNameLength: number; }> {
    const featureIndex = await this.hidpp.getFeatureIndex(0x0007);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0 // getFriendlyNameLen
    );
    const view = new Uint8Array(response);
    return {
      nameLength: view[0],
      nameMaxLength: view[1],
      defaultNameLength: view[2]
    };
  }

  async getDefaultFriendlyName(): Promise<string> {
    const featureIndex = await this.hidpp.getFeatureIndex(0x0007);
    const { defaultNameLength } = await this.getFriendlyNameLength();
    let buffer = new Uint8Array(defaultNameLength);
    for (let i = 0; i < defaultNameLength; i += 15) {
      const response = await this.hidpp.request(
        0x11,
        featureIndex,
        0x2, // getDefaultFriendlyName()
        new Uint8Array([i]).buffer
      );
      buffer.set(new Uint8Array(response, 1, Math.min(defaultNameLength - i, 15)), i);
    }
    return textDecoder.decode(buffer);
  }
}
