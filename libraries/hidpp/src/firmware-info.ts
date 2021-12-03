import { Hidpp } from './hidpp';

const textDecoder = new TextDecoder();

export enum FirmwareType {
  Firmware,
  Bootloader,
  Hardware,
  TouchPad,
  OpticalSensor,
  SoftDevice,
  RfMcu,
  FactoryApplication,
  RgbCustomEffect,
  MotorDrive,
}

export enum TransportType {
  Bluetooth = 1,
  BluetoothLE = 1 << 1,
  EQuad = 1 << 2,
  USB = 1 << 3,
}

export class FirmwareInfo {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getDeviceInfo(): Promise<{ entityCount: number; unitId: number, transports: TransportType[], modelId: number[]; extendedModelId: number; supportSerialNumber: boolean; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0003);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0x0,
    );
    const view = new DataView(response);
    const entityCount = view.getUint8(0);
    const unitId = view.getUint32(1);
    const transport = view.getUint16(5);
    const transports = [];
    for (let i = 0; i < 16; i += 1) {
      if ((transport & (1 << i)) !== 0) {
        transports.push(1 << i);
      }
    }
    const modelId = [view.getUint16(7), view.getUint16(9), view.getUint16(11),];
    const extendedModelId = view.getUint8(13);
    const capabilities = view.getUint8(14);
    const supportSerialNumber = (capabilities & 1) === 1;
    return { entityCount, unitId, transports, modelId, extendedModelId, supportSerialNumber };
  }

  async getFirmwareInfo(index: number): Promise<{ type: FirmwareType, name: string, major: number, minor: number, build: number; active: boolean; pid: number; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0003);
    const response = await this.hidpp.sendLongRequest(
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
          const flags = view.getUint8(8);
          const pid = view.getUint16(9);
          return { type, name, major, minor, build, active: (flags & 1) === 1, pid };
        }
      case FirmwareType.Hardware:
        return { type, name: '', major: view.getUint8(1), minor: 0, build: 0, active: false, pid: 0 };
      default:
        return { type, name: '', major: 0, minor: 0, build: 0, active: false, pid: 0 };
    }
  }

  async getSerialNumber(): Promise<string> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0003);
    const response = await this.hidpp.sendLongRequest(
      featureIndex,
      0x2,
    );
    console.error(response);
    return textDecoder.decode(response.slice(0, 12));
  }
}
