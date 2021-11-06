import { EventEmitter } from '@yume-chan/event';
import { Hidpp } from "./hidpp";

export class Receiver {
  hidpp: Hidpp;

  private children: Hidpp[] = [];

  private childConnectEvent = new EventEmitter<Hidpp>();
  public readonly onChildConnect = this.childConnectEvent.event;

  private childDisconnectEvent = new EventEmitter<Hidpp>();
  public readonly onChildDisconnect = this.childDisconnectEvent.event;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
    this.hidpp.device.addEventListener('inputreport', this.handleInputReport);
  }

  private handleInputReport = ({ reportId, data }: HIDInputReportEvent) => {
    if (reportId === 0x10 || reportId === 0x11) {
      const view = new Uint8Array(data.buffer);

      const deviceIndex = view[0];
      if (deviceIndex !== 0xff) {
        const command = view[1];
        if (command === 0x41) {
          // Device connected/disconnected
          if ((view[3] & (1 << 6)) === 0) {
            if (!this.children[deviceIndex]) {
              this.childConnectEvent.fire(this.getChild(deviceIndex));
            }
          } else {
            if (this.children[deviceIndex]) {
              this.childDisconnectEvent.fire(this.getChild(deviceIndex));
              delete this.children[deviceIndex];
            }
          }
          return;
        }

        this.children[deviceIndex]?.handleInputReport(data);
      } else {
        const command = view[1];
        const address = view[2];
        const slice = data.buffer.slice(3);
        console.log(
          `input message ${deviceIndex} 0x${command.toString(16).padStart(2, '0')} 0x${address.toString(16).padStart(2, '0')}`,
          Array.from(new Uint8Array(slice))
        );
      }
    } else {
      console.log(
        `raw input message 0x${reportId.toString(16)}`,
        Array.from(new Uint8Array(data.buffer))
      );
    }
  };

  public async getChildCount(): Promise<number> {
    await this.hidpp.getVersion();
    if (this.hidpp.version !== 1) {
      throw new Error('Unsupported version');
    }

    const response = await this.hidpp.request(
      0x10,
      0x81,
      0x02,
    );
    const view = new Uint8Array(response);

    return view[1];
  }

  public async detectChildren() {
    // Enable notification
    await this.hidpp.request(
      0x10,
      0x80,
      0x00,
      new Uint8Array([0x00, 0x01, 0x00]).buffer
    );

    // Request receiver to re-scan for devices
    await this.hidpp.request(
      0x10,
      0x80,
      0x02,
      new Uint8Array([0x02]).buffer
    );
  }

  public getChild(index: number): Hidpp {
    if (!this.children[index]) {
      this.children[index] = new Hidpp(this.hidpp.device, index, this);
    }

    return this.children[index];
  }
}
