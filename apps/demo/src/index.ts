import { AdjustableDpi, Hidpp, Receiver, requestDevice } from '@yume-chan/hidpp';

const settings = document.getElementById('settings') as HTMLDivElement;

document.getElementById('select-button')!.onclick = async () => {
  const device = await requestDevice();
  console.log(device);
  const hidpp = new Hidpp(device, 0xff);
  await hidpp.getVersion();
  console.log(hidpp);

  const devices: Hidpp[] = [];

  // Assume all HID++ 1.0 devices are USB receivers
  // (mouses/keyboards started using HID++ 2.0 a long time ago)
  if (hidpp.version === 1) {
    const receiver = new Receiver(hidpp);
    const childIndices = await receiver.getChildIndices();
    console.log(childIndices);

    for (const index of childIndices) {
      const child = receiver.getChild(index);
      devices.push(child);
    }
  } else {
    devices.push(hidpp);
  }

  for (const device of devices) {
    console.log(device);
    const dpi = new AdjustableDpi(device);
    const dpiList = await dpi.getDpiList();
    console.log(dpiList);
    const currentDpi = await dpi.getDpi();
    console.log(currentDpi);

    const label = document.createElement('label');
    label.innerText = `DPI: `;

    const select = document.createElement('select');
    for (const value of dpiList) {
      const option = document.createElement('option');
      option.value = value.toString();
      option.innerText = value.toString();
      select.appendChild(option);
    }
    select.value = currentDpi.toString();
    select.onchange = async () => {
      console.log(select.value);
      await dpi.setDpi(parseInt(select.value, 10));
    };

    label.appendChild(select);
    settings.appendChild(label);
  }
};
