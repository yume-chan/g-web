import { AsyncOperationManager, PromiseResolver } from '@yume-chan/async';
import Struct, { placeholder, Evaluate } from '@yume-chan/struct';
import { LinkedList } from "./linked-list";
import { HidppPacket } from "./packet";
import { deserialize, serialize } from "./struct";

export enum Feature {
  Root = 0x0000,
  FeatureSet = 0x0001,
}

interface FunctionDefinition {
  feature: Feature;
  index: number;
  parameter: Struct | undefined;
  response: Struct;
}

function createFeature<T extends Record<string, Omit<FunctionDefinition, 'feature'>>>(
  feature: Feature,
  definitions: T
): { [P in keyof T]: Evaluate<T[P] & { feature: Feature; }> } {
  for (const key in definitions) {
    (definitions[key] as any).feature = feature;
  }
  return definitions as any;
}

export const Functions = {
  [Feature.Root]: createFeature(Feature.Root, {
    GetFeature: {
      index: 0,
      parameter:
        new Struct()
          .uint16('feature', placeholder<Feature>()),
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
    }
  }),
  [Feature.FeatureSet]: createFeature(Feature.FeatureSet, {
    GetFeatureCount: {
      index: 0,
      parameter: undefined,
      response:
        new Struct()
          .uint8('count')
    }
  }),
};

const Hidpp2Packet = new Struct()
  .fields(HidppPacket)
  .uint8('parameter')
  .arrayBuffer('data', { length: 16 })
  .extra({
    get functionId() {
      return this.byte3 >> 4;
    },
    get softwareId() {
      return this.byte3 & 0x0f;
    },
  });

export class Hidpp2 {
  public device: HIDDevice;

  private requests: LinkedList<PromiseResolver<ArrayBuffer>> = new LinkedList();

  private features: Map<Feature, number> = new Map();

  constructor(device: HIDDevice) {
    this.device = device;
    this.device.addEventListener('inputreport', this.handleInputReport);

    this.features.set(Feature.Root, 0);
  }

  private handleInputReport = async ({ data }: HIDInputReportEvent) => {
    const packet = await deserialize(Hidpp2Packet, data.buffer);
    console.log('response', data.buffer, packet);
    this.requests.unshift()?.resolve(packet.data);
  };

  public async send<T extends FunctionDefinition>(
    definition: T,
    parameter: T['parameter'] extends Struct ? T['parameter']['TInit'] : void
  ): Promise<T['response']['TDeserializeResult']> {
    if (!this.device.opened) {
      await this.device.open();
    }

    const command = this.features.get(definition.feature) ?? await this.getFeature(definition.feature);

    const resolver = new PromiseResolver<ArrayBuffer>();
    this.requests.push(resolver);
    const data = serialize(Hidpp2Packet, {
      deviceIndex: 0xff,
      command,
      parameter: definition.index << 4 | 0x85,
      data: definition.parameter ? serialize(definition.parameter, parameter!) : new ArrayBuffer(0),
    });
    this.device.sendReport(0x10, data);
    console.log('request', definition, parameter, data);
    const response = await resolver.promise;
    return deserialize(definition.response, response);
  }

  public async getFeature(feature: Feature): Promise<number> {
    if (this.features.has(feature)) {
      return this.features.get(feature)!;
    }

    const { index } = await this.send(Functions[Feature.Root].GetFeature, { feature });
    this.features.set(feature, index);
    return index;
  }

  public async getFeatureCount(): Promise<number> {
    const { count } = await this.send(Functions[Feature.FeatureSet].GetFeatureCount, undefined);
    return count;
  }
}
