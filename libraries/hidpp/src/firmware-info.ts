import { Hidpp } from './hidpp';

const textDecoder = new TextDecoder();

export enum FirmwareType {
  Firmware,
  Bootloader,
  Hardware,
  Other,
}

export class FirmwareInfo {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getFirmwareCount(): Promise<number> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0003);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new Uint8Array(response);
    return view[0];
  }

  async getFirmwareVersion(index: number): Promise<{ type: FirmwareType, name: string, major: number, minor: number, build: number; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0003);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x1,
      new Uint8Array([index]).buffer,
    );
    const view = new DataView(response);
    const type = (view.getUint8(0) & 0xf) as FirmwareType;
    switch (type) {
      case FirmwareType.Firmware:
      case FirmwareType.Bootloader:
        {
          const name = textDecoder.decode(response.slice(1, 4));
          const major = view.getUint8(4);
          const minor = view.getUint8(5);
          const build = view.getUint16(6);
          return { type, name, major, minor, build };
        }
      case FirmwareType.Hardware:
        return { type, name: '', major: view.getUint8(1), minor: 0, build: 0 };
      default:
        return { type, name: '', major: 0, minor: 0, build: 0 };
    }
  }
}
