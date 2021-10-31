import { Hidpp } from './hidpp';

export class FeatureSet {
  hidpp: Hidpp;

  constructor(hidpp: Hidpp) {
    this.hidpp = hidpp;
  }

  async getFeatureCount(): Promise<number> {
    const { index: featureIndex } = await this.hidpp.getFeature(0x0001);
    const response = await this.hidpp.request(
      0x11,
      featureIndex,
      0x0,
    );
    const view = new Uint8Array(response);
    return view[0];
  }

  async *getFeatures(): AsyncGenerator<{ id: number, obsolete: boolean, hidden: boolean, internal: boolean; }, void, void> {
    const featureCount = await this.getFeatureCount();
    const { index: featureIndex } = await this.hidpp.getFeature(0x0001);
    for (let i = 0; i <= featureCount; i += 1) {
      const response = await this.hidpp.request(
        0x11,
        featureIndex,
        0x1,
        new Uint8Array([i]).buffer,
      );
      const view = new DataView(response);
      const id = view.getUint16(0);
      const flags = view.getUint8(2);
      yield {
        id,
        obsolete: (flags & (1 << 7)) !== 0,
        hidden: (flags & (1 << 6)) !== 0,
        internal: (flags & (1 << 5)) !== 0,
      };
    }
  }
}
