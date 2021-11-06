import { PromiseResolver } from "@yume-chan/async";
import { EventEmitter } from '@yume-chan/event';
import { Receiver } from "./receiver";
import { Mutex } from "./mutex";

const DEBUG = true;

export const DEVICE_FILTER: HIDDeviceFilter = { vendorId: 0x046d };

export const RECEIVER_PID_LIST = [0xc539, 0xc53f];

export enum Hidpp1ErrorCode {
  Success,
  InvalidCommand,
  InvalidAddress,
  InvalidValue,
  ConnectFail,
  TooManyDevices,
  AlreadyExists,
  Busy,
  UnknownDevice,
  ResourceError,
  RequestUnavailable,
  InvalidParamValue,
  WrongPinCode
}

export const Hidpp1ErrorMessage: Record<Hidpp1ErrorCode, string> = {
  [Hidpp1ErrorCode.Success]: 'No error',
  [Hidpp1ErrorCode.InvalidCommand]: 'Invalid command',
  [Hidpp1ErrorCode.InvalidAddress]: 'Invalid address',
  [Hidpp1ErrorCode.InvalidValue]: 'Invalid value',
  [Hidpp1ErrorCode.ConnectFail]: 'Connection request failed (Receiver)',
  [Hidpp1ErrorCode.TooManyDevices]: 'Too many devices connected (Receiver)',
  [Hidpp1ErrorCode.AlreadyExists]: 'Already exists (Receiver)',
  [Hidpp1ErrorCode.Busy]: 'Busy (Receiver)',
  [Hidpp1ErrorCode.UnknownDevice]: 'Unknown device (Receiver)',
  [Hidpp1ErrorCode.ResourceError]: 'Resource error (Receiver)',
  [Hidpp1ErrorCode.RequestUnavailable]: 'Request not valid in current context',
  [Hidpp1ErrorCode.InvalidParamValue]: 'Request parameter has unsupported value',
  [Hidpp1ErrorCode.WrongPinCode]: 'The PIN code entered on the device was wrong',
};

export enum Hidpp2ErrorCode {
  InvalidArgument = 0x02,
  OutOfRange,
  HardwareError,
  LogitechInternal,
  InvalidFeatureIndex,
  InvalidFunction,
  Busy,
  Unsupported,
}

export const Hidpp2ErrorMessage: Record<Hidpp2ErrorCode, string> = {
  [Hidpp2ErrorCode.InvalidArgument]: 'Invalid Argument',
  [Hidpp2ErrorCode.OutOfRange]: 'Out of Range',
  [Hidpp2ErrorCode.HardwareError]: 'Hardware Error',
  [Hidpp2ErrorCode.LogitechInternal]: 'Internal Error',
  [Hidpp2ErrorCode.InvalidFeatureIndex]: 'Invalid Feature Index',
  [Hidpp2ErrorCode.InvalidFunction]: 'Invalid Function',
  [Hidpp2ErrorCode.Busy]: 'Device Busy',
  [Hidpp2ErrorCode.Unsupported]: 'Unsupported',
};

export function concatArrayBuffers(...args: (ArrayBuffer | undefined)[]) {
  let totalLength = 0;
  for (const buffer of args) {
    if (buffer) {
      totalLength += buffer.byteLength;
    }
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of args) {
    if (buffer) {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
  }

  return result.buffer;
}

export class Hidpp {
  device: HIDDevice;
  index: number;
  receiver?: Receiver;

  version: number | undefined;

  private disconnectEvent = new EventEmitter<void>();
  public readonly onDisconnect = this.disconnectEvent.event;

  private _mutex = new Mutex();
  private _request: { command: number, address: number, resolver: PromiseResolver<ArrayBuffer>; } | undefined;
  private _featureIdToIndex: Record<number, { index: number, version: number; }> = {};

  constructor(device: HIDDevice, index: number, receiver?: Receiver) {
    this.device = device;
    this.index = index;
    this.receiver = receiver;

    if (this.index === 0xff) {
      this.device.addEventListener('inputreport', this.handleRawInputReport);
    }

    if (this.receiver) {
      this._mutex = this.receiver.hidpp._mutex;
      const dispose = this.receiver.onChildDisconnect(hidpp => {
        if (hidpp === this) {
          this.disconnectEvent.fire();
          dispose();
        }
      });
    }
  }

  handleRawInputReport = ({ reportId, data }: HIDInputReportEvent) => {
    if (reportId === 0x10 || reportId === 0x11) {
      this.handleInputReport(data);
    } else if (DEBUG) {
      console.log(
        `raw input message 0x${reportId.toString(16)}`,
        Array.from(new Uint8Array(data.buffer))
      );
    }
  };

  handleInputReport = (data: DataView) => {
    const view = new Uint8Array(data.buffer);

    const deviceIndex = view[0];

    if (DEBUG) {
      const command = view[1];
      const address = view[2];
      const slice = data.buffer.slice(3);
      console.log(
        `input message ${deviceIndex} 0x${command.toString(16).padStart(2, '0')} 0x${address.toString(16).padStart(2, '0')}`,
        Array.from(new Uint8Array(slice))
      );
    }

    if (deviceIndex !== this.index) {
      return;
    }

    const request = this._request;
    if (!request) {
      // We didn't send any request before
      return;
    }

    let command = view[1];
    if (command === 0x8f) {
      // HID++ 1 error packet
      command = view[2];
      const address = view[3];
      // Is it for our last request?
      if (request.command === command && request.address === address) {
        const errorCode = view[4] as Hidpp1ErrorCode;

        if (DEBUG) {
          console.error(`error ${command.toString(16)} ${address.toString(16)} ${Hidpp1ErrorMessage[errorCode]}`);
        }

        const error = new Error(Hidpp1ErrorMessage[errorCode] ?? 'Hidpp 1 Error');
        error.name = 'Hidpp1Error';
        (error as any).code = errorCode;
        request.resolver.reject(error);
        this._request = undefined;
      }
      return;
    } else if (command === 0xff) {
      command = view[2];
      const address = view[3];
      if (request.command === command && request.address === address) {
        const errorCode = view[4] as Hidpp2ErrorCode;

        if (DEBUG) {
          console.error(`error ${command.toString(16)} ${address.toString(16)} ${Hidpp2ErrorMessage[errorCode]}`);
        }

        const error = new Error(Hidpp2ErrorMessage[errorCode] ?? 'Hidpp 2 Error');
        error.name = 'Hidpp2Error';
        (error as any).code = errorCode;
        request.resolver.reject(error);
        this._request = undefined;
      }
    }

    const address = view[2];

    // Is it for our last request?
    if (request.command === command && request.address === address) {
      const slice = data.buffer.slice(3);

      if (DEBUG) {
        console.log(
          `response ${deviceIndex} 0x${command.toString(16)} 0x${(this.version === 2 ? address >> 4 : address).toString(16)}`,
          Array.from(new Uint8Array(slice))
        );
      }

      request.resolver.resolve(slice);
      this._request = undefined;
    }
  };

  public async getVersion() {
    if (this.version) {
      return;
    }

    if (!this.device.opened) {
      await this.device.open();
    }

    // Find 0x11 output report
    const longReportId = this.device.collections.some(
      collection =>
        collection.outputReports?.some(
          report => report.reportId === 0x11
        )
    );

    if (!longReportId) {
      // Super old device?
      this.version = 1;
    } else {
      const resolver = new PromiseResolver<ArrayBuffer>();

      // Assume device is version 2
      const command = 0x00; // Root
      const address = 0x01 << 4; // GetProtocolVersion

      this._request = { command, address, resolver };

      await this.device.sendReport(
        0x11,
        new Uint8Array([
          this.index,
          command,
          address,
          // unused0: 0
          // unused1: 0
          // ping: 0
        ])
      );

      try {
        await resolver.promise;
        this.version = 2;
      } catch (e) {
        if (e instanceof Error &&
          e.name === 'Hidpp1Error' &&
          (e as any).code === Hidpp1ErrorCode.InvalidCommand) {
          this.version = 1;
        } else {
          throw e;
        }
      }
    }
  }

  public async getFeature(featureId: number) {
    await this.getVersion();
    if (this.version === 1) {
      throw new Error('Feature not supported in HID++ 1.0');
    }

    if (this._featureIdToIndex[featureId]) {
      return this._featureIdToIndex[featureId];
    }

    const data = new ArrayBuffer(2);
    {
      const view = new DataView(data);
      view.setUint16(0, featureId);
    }

    const response = await this.request(
      0x11,
      0x0000, // Root
      0x0, // GetFeature
      data,
    );
    const view = new Uint8Array(response);

    const index = view[0];
    if (index === 0) {
      throw new Error('Feature not supported');
    }

    const version = view[2];

    this._featureIdToIndex[featureId] = { index, version };
    return { index, version };
  }

  public async request(
    reportId: number,
    command: number, // feature index in HID++ 2
    address: number, // function index in HID++ 2
    data?: ArrayBuffer
  ): Promise<ArrayBuffer> {
    if (!this.version) {
      throw new Error('Unknown device version');
    }

    await this._mutex.wait();

    try {
      if (!this.device.opened) {
        await this.device.open();
      }

      if (DEBUG) {
        console.log(
          `request 0x${command.toString(16)} 0x${address.toString(16)}`,
          data ? Array.from(new Uint8Array(data)) : '',
        );
      }

      if (this.version === 2) {
        address = address << 4;
      }

      const resolver = new PromiseResolver<ArrayBuffer>();
      this._request = { command, address, resolver };

      await this.device.sendReport(
        reportId,
        concatArrayBuffers(
          new Uint8Array([this.index, command, address,]),
          data
        )
      );

      const response = await resolver.promise;
      return response;
    } finally {
      this._mutex.notify();
    }
  }
}

export function isHidppDevice(device: HIDDevice) {
  return device.collections.some(
    collection =>
      collection.usagePage === 0xff43 || // modern devices
      collection.usagePage === 0xff00 // legacy devices
  );
}

export async function requestDevice(): Promise<HIDDevice> {
  const devices = await window.navigator.hid.requestDevice({
    filters: [DEVICE_FILTER],
  });
  if (devices.length === 0) {
    throw new Error('No device selected');
  }
  const device = devices.find(isHidppDevice);
  if (!device) {
    throw new Error('Device not recognized');
  }
  return device;
}
