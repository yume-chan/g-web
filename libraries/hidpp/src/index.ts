import { AsyncOperationManager } from '@yume-chan/async';
import Struct from '@yume-chan/struct';

export enum Feature {
  FeatureSet = 0x0001,
}

export const HidppPacket =
  new Struct({ littleEndian: false })
    .uint8('deviceIndex')
    .uint8('featureId')
    .uint8('byte3')
    .arrayBuffer('data', { length: 16 });

export type HidppPacket = typeof HidppPacket['TDeserializeResult'];

export class Hidpp {
  public device: HIDDevice;

  private dispatcher = new AsyncOperationManager();

  constructor(device: HIDDevice) {
    this.device = device;
    this.device.addEventListener('inputreport', this.handleInputReport);
  }

  private handleInputReport = ({ data }: HIDInputReportEvent) => {

  };

  public async send(featureId: number, functionId: number): Promise<ArrayBuffer> {
    const [id, promise] = this.dispatcher.add<HidppPacket>();
    this.device.sendReport(0x11, HidppPacket.serialize({
      deviceIndex: 0xff,
      featureId,
      byte3: functionId << 4 | (id & 0xF),
      data: new ArrayBuffer(16)
    }, {
      encodeUtf8(input) {
        return new TextEncoder().encode(input);
      }
    }));
    const response = await promise;
    return response.data;
  }

  public async getFeature(feature: Feature): Promise<number> {
    const response = await this.send(0x00, 0x0);
    return new Uint8Array(response)[0];
  }
}
