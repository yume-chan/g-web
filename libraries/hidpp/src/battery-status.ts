import { Hidpp } from "./hidpp";

export enum BatteryChargeStatus {
  Discharing,
  Recharging,
  AlmostFull,
  SlowRecharge,
  InvalidBattery,
  TerminalError,
}

export class BatteryStatus {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getBattery(): Promise<{ percentage: number, status: BatteryChargeStatus; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1000);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0 // getBattery
    );
    const view = new Uint8Array(response);
    return {
      percentage: view[0],
      status: view[2],
    };
  }
}
