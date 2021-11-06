import { Hidpp } from "./hidpp";

export enum BatteryStatus1000 {
  Discharging,
  Charging,
  AlmostFull,
  Charged,
  SlowRecharge,
  InvalidBattery,
  TerminalError,
  OtherError
}

export enum BatteryStatus1001 {
  FastCharging = 1 << 3,
  SlowCharging = 1 << 4,
  LevelCritical = 1 << 5,
  Charging = 1 << 7,
}

export enum BatteryLevel1004 {
  Critical = 1,
  Low = 1 << 1,
  Good = 1 << 2,
  Full = 1 << 3,
}

export enum BatteryStatus1f20 {
  Discharging = 0x01,
  Charging = 0x02,
  ChargingComplete = 0x02 | 0x04,
  ChargingFault = 0x02 | 0x08,
}

export class Battery {
  hidpp: Hidpp;

  static mapVoltageToSoc(voltage: number): number {
    const voltages = [
      4186, 4156, 4143, 4133, 4122, 4113, 4103, 4094, 4086, 4075,
      4067, 4059, 4051, 4043, 4035, 4027, 4019, 4011, 4003, 3997,
      3989, 3983, 3976, 3969, 3961, 3955, 3949, 3942, 3935, 3929,
      3922, 3916, 3909, 3902, 3896, 3890, 3883, 3877, 3870, 3865,
      3859, 3853, 3848, 3842, 3837, 3833, 3828, 3824, 3819, 3815,
      3811, 3808, 3804, 3800, 3797, 3793, 3790, 3787, 3784, 3781,
      3778, 3775, 3772, 3770, 3767, 3764, 3762, 3759, 3757, 3754,
      3751, 3748, 3744, 3741, 3737, 3734, 3730, 3726, 3724, 3720,
      3717, 3714, 3710, 3706, 3702, 3697, 3693, 3688, 3683, 3677,
      3671, 3666, 3662, 3658, 3654, 3646, 3633, 3612, 3579, 3537
    ];

    for (let i = 0; i < voltages.length; i += 1) {
      if (voltage > voltages[i]) {
        return voltages.length - i;
      }
    }

    return 0;
  }

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getBattery1000(): Promise<{ level: number, nextLevel: number, status: BatteryStatus1000; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1000);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new Uint8Array(response);
    return {
      level: view[0],
      nextLevel: view[1],
      status: view[2],
    };
  }

  async getBattery1001(): Promise<{ voltage: number, status: BatteryStatus1001; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1001);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new DataView(response);
    return {
      voltage: view.getUint16(0),
      status: view.getUint8(2),
    };
  }

  async getBattery1004(): Promise<{ percentage: number, level: BatteryLevel1004, status: BatteryStatus1000, }> {
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

  async getBattery1f20(): Promise<{ voltage: number, status: BatteryStatus1f20; }> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x1f20);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0
    );
    const view = new DataView(response);
    const voltage = view.getUint16(0);
    const status = view.getUint8(2);
    return { voltage, status };
  }
}
