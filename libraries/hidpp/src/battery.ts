import { Hidpp } from "./hidpp";

export enum BatteryStatus {
  Discharging,
  Recharging,
  AlmostFull,
  Charged,
  SlowRecharge,
  InvalidBattery,
  TerminalError,
}

export class Battery {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getBattery(): Promise<{ level: number, nextLevel: number, status: BatteryStatus; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1000);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0 // getBattery
    );
    const view = new Uint8Array(response);
    return {
      level: view[0],
      nextLevel: view[1],
      status: view[2],
    };
  }
}
