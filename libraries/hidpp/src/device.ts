import { Hidpp1 } from "./hidpp1";
import { Hidpp2 } from "./hidpp2";

export const DEVICE_FILTER: HIDDeviceFilter = { vendorId: 0x046d };

const RECEIVER_PID_LIST = [0xc539, 0xc53f];

export async function requestDevice(): Promise<Hidpp1 | Hidpp2> {
  const devices = await window.navigator.hid.requestDevice({
    filters: [DEVICE_FILTER],
  });
  const device = devices.find(
    device =>
      device.collections.find(
        collection =>
          collection.usagePage === 0xff43 || // modern devices
          collection.usagePage === 0xff00 // lagacy devices
      )
  );
  if (!device) {
    throw new Error('No device found');
  }
  if (RECEIVER_PID_LIST.includes(device.productId)) {
    return new Hidpp1(device);
  } else {
    return new Hidpp2(device);
  }
}
