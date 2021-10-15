import { PromiseResolver } from "@yume-chan/async";
import Struct, { placeholder } from "@yume-chan/struct";
import { Mutex } from "./mutex";
import { concatArrayBuffers, HidppPacket } from "./packet";
import { deserialize, serialize } from "./struct";

enum Hidpp1RegisterLength {
  Short,
  Long,
}

export interface Hidpp1RegisterDefinition {
  address: number,
  read: {
    length: Hidpp1RegisterLength,
    parameter?: Struct | undefined,
    response: Struct;
  };
  write?: {
    length: Hidpp1RegisterLength,
    parameter?: Struct | undefined,
    response: Struct;
  };
}

export function createHidpp1Registers<T extends Record<string, Hidpp1RegisterDefinition>>(definitions: T): T {
  return definitions;
}

export const Hidpp1Register = createHidpp1Registers({
  Notifications: {
    address: 0x00,
    read: {
      length: Hidpp1RegisterLength.Short,
      response:
        new Struct()
          .uint8('devices')
          .uint8('receiver')
          .uint8('devices2')
    },
    write: {
      length: Hidpp1RegisterLength.Short,
      parameter:
        new Struct()
          .uint8('devices')
          .uint8('receiver')
          .uint8('devices2'),
      response:
        new Struct()
    }
  },
  ConnectionState: {
    address: 0x02,
    read: {
      length: Hidpp1RegisterLength.Short,
      response:
        new Struct()
          .uint8('unknown')
          .uint8('receiverState')
    }
  }
});

export interface Hidpp1ReceiverRegisterDefinition {
  register: number,
  length: Hidpp1RegisterLength;
  parameter?: Struct | undefined;
  response: Struct;
}

export function createHidpp1ReceiverRegisters<T extends Record<string, Hidpp1ReceiverRegisterDefinition>>(definitions: T): T {
  return definitions;
}

export const Hidpp1ReceiverRegister = createHidpp1ReceiverRegisters({
  ReceiverInformation: {
    register: 0x03,
    length: Hidpp1RegisterLength.Long,
    response:
      new Struct()
        .uint32('serial')
        .uint8('dfuStatus')
        .uint8('dfuCancellable')
        .uint8('maxDevices')
  },
});

export interface Hidpp1ReceiverDeviceRegisterDefinition {
  begin: number;
  response: Struct<any, any, any, any>;
}

function createHidpp1ReceiverDeviceRegisters<T extends Record<string, Hidpp1ReceiverDeviceRegisterDefinition>>(definitions: T): T {
  return definitions;
}

export const Hidpp1ReceiverDeviceRegister = createHidpp1ReceiverDeviceRegisters({
  PairingInformation: {
    begin: 0x20,
    response:
      new Struct()
        .uint8('destinationId')
        .uint8('reportInterval')
        .uint16('pid')
        .uint8('reserved1')
        .uint8('reserved2')
        .uint8('deviceType')
  },
  ExtendedPairingInformation: {
    begin: 0x30,
    response:
      new Struct()
        .uint32('serial')
        .uint32('reportTypes')
        .uint8('usabilityInfo')
        .extra({
          get powerSwitchLocation() {
            return this.usabilityInfo & 0b111;
          }
        })
  },
  DeviceName: {
    begin: 0x40,
    response:
      new Struct()
        .uint8('length')
        .string('name', { lengthField: 'length' })
  }
});

export const Hidpp1RegisterAccessPacket = new Struct()
  .uint8('address');

export const Hidpp1ErrorPacket = new Struct()
  .uint8('command')
  .uint8('address')
  .uint8('errorCode', placeholder<Hidpp1ErrorCode>());

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

export const Hidpp1ErrorMessages: Record<Hidpp1ErrorCode, string> = {
  [Hidpp1ErrorCode.Success]: 'No error / undefined',
  [Hidpp1ErrorCode.InvalidCommand]: 'Invalid SubID / command',
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

export class Hidpp1 {
  public device: HIDDevice;

  // HID++ 1.0 only allow one request at a time
  private mutex = new Mutex();
  private request: PromiseResolver<ArrayBuffer> | undefined;

  constructor(device: HIDDevice) {
    this.device = device;
    this.device.addEventListener('inputreport', this.handleInputReport);
  }

  private handleInputReport = async ({ data }: HIDInputReportEvent) => {
    this.mutex.notify();
    const response = await deserialize(HidppPacket, data.buffer);
    if (response.command >= 0x80 && this.request) {
      if (response.command === 0x8f) {
        const errorPacket = await deserialize(Hidpp1ErrorPacket, data.buffer.slice(HidppPacket.size));
        const error = new Error(Hidpp1ErrorMessages[errorPacket.errorCode]);
        (error as any).code = errorPacket.errorCode;
        this.request.reject(error);
      } else {
        const accessPacket = await deserialize(Hidpp1RegisterAccessPacket, data.buffer.slice(HidppPacket.size));
        const remaining = data.buffer.slice(HidppPacket.size + Hidpp1RegisterAccessPacket.size);
        this.request.resolve(remaining);
        this.request = undefined;
      }
    }
  };

  private async checkOpened() {
    if (!this.device.opened) {
      await this.device.open();
    }
  }

  public async read<T extends Hidpp1RegisterDefinition>(
    definition: T,
    parameter: T['read']['parameter'] extends Struct ? T['read']['parameter']['TInit'] : void
  ): Promise<T['read']['response']['TDeserializeResult']> {
    await this.checkOpened();
    await this.mutex.wait();

    const resolver = new PromiseResolver<ArrayBuffer>();
    this.request = resolver;

    await this.device.sendReport(0x10, concatArrayBuffers(
      serialize(HidppPacket, {
        deviceIndex: 0xff,
        command: definition.read.length === Hidpp1RegisterLength.Short ? 0x81 : 0x83,
      }),
      serialize(Hidpp1RegisterAccessPacket, {
        address: definition.address,
      }),
      definition.read.parameter ? serialize(definition.read.parameter, parameter!) : new ArrayBuffer(0)
    ));

    const response = await resolver.promise;
    return deserialize(definition.read.response, response);
  }

  public async readReceiverRegister<T extends Hidpp1ReceiverRegisterDefinition>(
    definition: T,
    parameter: T['parameter'] extends Struct ? T['parameter']['TInit'] : void
  ): Promise<T['response']['TDeserializeResult']> {
    await this.checkOpened();
    await this.mutex.wait();

    const resolver = new PromiseResolver<ArrayBuffer>();
    this.request = resolver;

    await this.device.sendReport(0x10, concatArrayBuffers(
      serialize(HidppPacket, {
        deviceIndex: 0xff,
        command: definition.length === Hidpp1RegisterLength.Short ? 0x81 : 0x83,
      }),
      serialize(Hidpp1RegisterAccessPacket, {
        // All address are 0xb5 (receiver state)
        address: 0xb5,
      }),
      new Uint8Array([definition.register]).buffer,
      definition.parameter ? serialize(definition.parameter, parameter!) : new ArrayBuffer(0)
    ));

    const response = await resolver.promise;
    // Skip address
    return deserialize(definition.response, response.slice(1));
  }

  public async readReceiverDeviceRegister<T extends Hidpp1ReceiverDeviceRegisterDefinition>(
    definition: T,
    index: number
  ): Promise<T['response']['TDeserializeResult']> {
    await this.checkOpened();
    await this.mutex.wait();

    const resolver = new PromiseResolver<ArrayBuffer>();
    this.request = resolver;

    await this.device.sendReport(0x10, concatArrayBuffers(
      serialize(HidppPacket, {
        deviceIndex: 0xff,
        // All commands are long read
        command: 0x83,
      }),
      serialize(Hidpp1RegisterAccessPacket, {
        // All address are 0xb5 (receiver state)
        address: 0xb5,
      }),
      new Uint8Array([definition.begin + index]).buffer
    ));

    const response = await resolver.promise;
    // Skip device index
    return deserialize(definition.response, response.slice(1));
  }
}
