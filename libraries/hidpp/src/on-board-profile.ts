import { Hidpp } from "./hidpp";

export enum OnBoardProfileMode {
  NoChange = 0x0,
  OnBoard = 0x1,
  Host = 0x2,
}

export class OnBoardProfile {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getInfo() {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0x0
    );
    const view = new DataView(response);
    return {
      memoryModelId: view.getUint8(0),
      profileFormatId: view.getUint8(1),
      macroFormatId: view.getUint8(2),
      profileCount: view.getUint8(3),
      profileCountOob: view.getUint8(4),
      buttonCount: view.getUint8(5),
      sectorCount: view.getUint8(6),
      sectorSize: view.getUint16(7),
      mechanicalLayout: view.getUint8(9),
      variousInfo: view.getUint8(10),
    };
  }

  async setMode(mode: OnBoardProfileMode) {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    await this.hidpp.sendLongRequest(
      featureIndex,
      0x1,
      new Uint8Array([mode]).buffer
    );
  }

  async getMode(): Promise<OnBoardProfileMode> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0x2
    );
    const view = new Uint8Array(response);
    return view[0];
  }

  async getCurrentProfile(): Promise<number> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0x4
    );
    const view = new Uint8Array(response);
    return view[0];
  }

  async readSector(sector: number, size: number) {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    const request = new ArrayBuffer(4);
    const view = new DataView(request);
    view.setUint16(0, sector);
    const data = new Uint8Array(size);
    for (let offset = 0; offset < size; offset += 16) {
      offset = Math.min(offset, size - 16);
      view.setUint16(2, offset);

      {
        const response = await this.hidpp.sendLongRequest(
          featureIndex,
          0x5,
          request
        );
        const view = new Uint8Array(response);
        data.set(view, offset);
      }
    }
    return data.buffer;
  }

  async getProfilesInfo() {
    const { profileCount, sectorSize } = await this.getInfo();
    const data = await this.readSector(0x0000, sectorSize);
    const view = new DataView(data);
    const profiles = [];
    for (let i = 0; i < profileCount; i++) {
      const profile = {
        address: view.getUint16(i * 4),
        enabled: view.getUint8(i * 4 + 2) === 1,
      };
      profiles.push(profile);
    }
    return profiles;
  }

  async readProfile(address: number) {
    const { sectorSize } = await this.getInfo();
    const response = await this.readSector(address, sectorSize);
    const view = new DataView(response);
    return {
      reportRate: view.getUint8(0),
      defaultDpi: view.getUint8(1),
      switchedDpi: view.getUint8(2),
      dpi: (() => {
        const list = [];
        for (let i = 0; i < 5; i += 1) {
          list.push(view.getUint16(3 + i * 2, true));
        }
        return list;
      })(),
      color: {
        r: view.getUint8(11),
        g: view.getUint8(12),
        b: view.getUint8(13),
      },
      powerMode: view.getUint8(14),
      angleSnapping: view.getUint8(15),
      powerSaveTimeout: view.getUint8(26),
      powerOffTimeout: view.getUint8(27),
    };
  }

  async getCurrentDpiIndex() {
    const { index: featureIndex } = await this.hidpp.getFeature(0x8100);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0xb
    );
    const view = new Uint8Array(response);
    return view[0];
  }
}
