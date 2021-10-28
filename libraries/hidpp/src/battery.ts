import { Hidpp } from "./hidpp";

export enum BatteryStatus {
  Discharging,
  Charging,
  AlmostFull,
  Charged,
  SlowRecharge,
  InvalidBattery,
  TerminalError,
  OtherError
}

export enum BatteryStatusV1 {
  FastCharging = 1 << 3,
  SlowCharging = 1 << 4,
  LevelCritical = 1 << 5,
  Charging = 1 << 7,
}

export enum BatteryLevelV4 {
  Critical = 1,
  Low = 1 << 1,
  Good = 1 << 2,
  Full = 1 << 3,
}

export class Battery {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getBattery(): Promise<{ percentage: number, nextPercentage: number, status: BatteryStatus; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1000);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new Uint8Array(response);
    return {
      percentage: view[0],
      nextPercentage: view[1],
      status: view[2],
    };
  }

  async getBatteryV1(): Promise<{ voltage: number, flags: BatteryStatusV1, }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1001);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new DataView(response);
    return {
      voltage: view.getUint16(0),
      flags: view.getUint8(2),
    };
  }

  async getBatteryV4(): Promise<{ percentage: number, level: BatteryLevelV4, status: BatteryStatus, }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1004);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x1,
    );
    const view = new DataView(response);
    return {
      percentage: view.getUint8(0),
      level: view.getUint8(1),
      status: view.getUint8(2),
    };
  }
}
