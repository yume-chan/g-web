import { Hidpp } from "./hidpp";

const textDecoder = new TextDecoder();

export enum DeviceType {
  Keyboard,
  RemoteControl,
  Numpad,
  Mouse,
  TrackPad,
  Trackball,
  Presenter,
  Receiver,
  Headset,
  Webcam,
  SteeringWheel,
  Joystick,
  Gamepad,
  Dock,
  Speaker,
  Microphone,
}

export class TypeAndName {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getNameLength(): Promise<number> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0005);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0, // getDeviceNameCount
    );
    const view = new Uint8Array(response);
    return view[0];
  }

  async getName(): Promise<string> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0005);
    const nameLength = await this.getNameLength();
    let buffer = new Uint8Array(nameLength);
    for (let i = 0; i < nameLength; i += 16) {
      const response = await this.hidpp.request(
        0x11,
        featureIndex,
        0x1, // getDeviceName()
        new Uint8Array([i]).buffer
      );
      buffer.set(new Uint8Array(response, 0, Math.min(nameLength - i, 16)), i);
    }
    return textDecoder.decode(buffer);
  }

  async getType(): Promise<DeviceType> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0005);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x2,
    );
    const view = new Uint8Array(response);
    return view[0];
  }
}
