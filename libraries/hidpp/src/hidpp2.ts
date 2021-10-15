import { AsyncOperationManager, PromiseResolver } from '@yume-chan/async';
import Struct, { placeholder, Evaluate } from '@yume-chan/struct';
import { LinkedList } from "./linked-list";
import { HidppPacket } from "./packet";
import { deserialize, serialize } from "./struct";

export enum Hidpp2Feature {
  Root = 0x0000,
  FeatureSet = 0x0001,
  ReportRate = 0x8060,
}

interface Hidpp2FunctionDefinition {
  feature: Hidpp2Feature;
  index: number;
  parameter: Struct | undefined;
  response: Struct;
}

function createFeature<T extends Record<string, Omit<Hidpp2FunctionDefinition, 'feature'>>>(
  feature: Hidpp2Feature,
  definitions: T
): { [P in keyof T]: Evaluate<T[P] & { feature: Hidpp2Feature; }> } {
  for (const key in definitions) {
    (definitions[key] as any).feature = feature;
  }
  return definitions as any;
}

export const Hidpp2Function = {
  [Hidpp2Feature.Root]: createFeature(Hidpp2Feature.Root, {
    GetFeature: {
      index: 0,
      parameter:
        new Struct()
          .uint16('feature', placeholder<Hidpp2Feature>()),
      response:
        new Struct()
          .uint8('index'),
    },
    GetProtocolVersion: {
      index: 1,
      parameter:
        new Struct()
          .uint8('unused1')
          .uint8('unused2')
          .uint8('pingData'),
      response:
        new Struct()
          .uint8('protocolMajor')
          .uint8('protocolMinor')
          .uint8('pingData'),
    },
  }),
  [Hidpp2Feature.FeatureSet]: createFeature(Hidpp2Feature.FeatureSet, {
    GetFeatureCount: {
      index: 0,
      parameter: undefined,
      response:
        new Struct()
          .uint8('count')
    },
    GetFeatureId: {
      index: 1,
      parameter:
        new Struct()
          .uint8('featureIndex'),
      response:
        new Struct()
          .uint16('featureId', placeholder<Hidpp2Feature>())
    }
  }),
  [Hidpp2Feature.ReportRate]: createFeature(Hidpp2Feature.ReportRate, {
    GetReportRateList: {
      index: 0,
      parameter: undefined,
      response:
        new Struct()
          .uint8('flags')
          .extra({
            supported(reportRate: number) {
              if (reportRate > 8) {
                return false;
              }
              return (this.flags & (1 << (reportRate - 1))) !== 0;
            },
          })
    },
    GetReportRate: {
      index: 1,
      parameter: undefined,
      response:
        new Struct()
          .uint8('reportRate')
    },
    SetReportRate: {
      index: 2,
      parameter:
        new Struct()
          .uint8('reportRate'),
      response:
        new Struct()
    }
  }),
};

const Hidpp2Packet = new Struct()
  .fields(HidppPacket)
  .uint8('parameter')
  .arrayBuffer('data', { length: 16 })
  .extra({
    get functionId() {
      return this.parameter >> 4;
    },
    get softwareId() {
      return this.parameter & 0x0f;
    },
  });

export class Hidpp2 {
  public device: HIDDevice;

  private requests: LinkedList<PromiseResolver<ArrayBuffer>> = new LinkedList();

  private featureIdToIndex: Map<Hidpp2Feature, number> = new Map();
  private featureIndexToId: Map<number, Hidpp2Feature> = new Map();

  constructor(device: HIDDevice) {
    this.device = device;
    this.device.addEventListener('inputreport', this.handleInputReport);

    this.featureIdToIndex.set(Hidpp2Feature.Root, 0);
    this.featureIndexToId.set(0, Hidpp2Feature.Root);
  }

  private handleInputReport = async ({ data }: HIDInputReportEvent) => {
    const packet = await deserialize(Hidpp2Packet, data.buffer);
    console.log('response', packet);
    this.requests.unshift()?.resolve(packet.data);
  };

  public async send<T extends Hidpp2FunctionDefinition>(
    definition: T,
    parameter: T['parameter'] extends Struct ? T['parameter']['TInit'] : void
  ): Promise<T['response']['TDeserializeResult']> {
    if (!this.device.opened) {
      await this.device.open();
    }

    const command = this.featureIdToIndex.get(definition.feature) ?? await this.getFeatureIndex(definition.feature);

    const resolver = new PromiseResolver<ArrayBuffer>();
    this.requests.push(resolver);
    const data = serialize(Hidpp2Packet, {
      deviceIndex: 0xff,
      command,
      parameter: definition.index << 4 | 0xa,
      data: definition.parameter ? serialize(definition.parameter, parameter!) : new ArrayBuffer(0),
    });
    this.device.sendReport(0x11, data);
    const response = await resolver.promise;
    return deserialize(definition.response, response);
  }

  public async getFeatureIndex(feature: Hidpp2Feature): Promise<number> {
    if (this.featureIdToIndex.has(feature)) {
      return this.featureIdToIndex.get(feature)!;
    }

    const { index } = await this.send(Hidpp2Function[Hidpp2Feature.Root].GetFeature, { feature });
    if (index === 0) {
      throw new Error('feature not supported');
    }
    this.featureIdToIndex.set(feature, index);
    this.featureIndexToId.set(index, feature);
    return index;
  }

  public async getFeatureCount(): Promise<number> {
    const { count } = await this.send(Hidpp2Function[Hidpp2Feature.FeatureSet].GetFeatureCount, undefined);
    return count;
  }

  public async getFeatureId(index: number): Promise<Hidpp2Feature> {
    if (this.featureIndexToId.has(index)) {
      return this.featureIndexToId.get(index)!;
    }

    const { featureId } = await this.send(Hidpp2Function[Hidpp2Feature.FeatureSet].GetFeatureId, { featureIndex: index });
    this.featureIdToIndex.set(featureId, index);
    this.featureIndexToId.set(index, featureId);
    return featureId;
  }
}
