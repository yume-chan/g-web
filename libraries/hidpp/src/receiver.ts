import { Hidpp } from "./hidpp";

export class Receiver {
  hidpp: Hidpp;

  private children: Hidpp[] = [];

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
    this.hidpp.device.addEventListener('inputreport', this.handleInputReport);
  }

  private handleInputReport = ({ data }: HIDInputReportEvent) => {
    const view = new Uint8Array(data.buffer);

    const deviceIndex = view[0];
    if (deviceIndex !== 0xff) {
      this.children[deviceIndex]?.handleInputReport({ data });
    }
  };

  public async getChildIndices(): Promise<number[]> {
    await this.hidpp.getVersion();
    if (this.hidpp.version !== 1) {
      throw new Error('Unsupported version');
    }

    const response = await this.hidpp.request(
      0x10,
      0x81,
      0x02,
    );

    const state = new Uint8Array(response)[1];
    const children = [];
    for (let i = 0; i < 8; i++) {
      if (state & (1 << i)) {
        children.push(i + 1);
      }
    }
    return children;
  }

  public getChild(index: number): Hidpp {
    if (!this.children[index]) {
      this.children[index] = new Hidpp(this.hidpp.device, index, this.hidpp);
    }

    return this.children[index];
  }
}
