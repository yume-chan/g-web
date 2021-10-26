import { AdjustableDpi, Hidpp, Receiver, ReportRate, requestDevice, TypeAndName } from "@yume-chan/hidpp";

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

    const name = document.createElement('div');
    // const friendlyName = new FriendlyName(device);
    // name.textContent = await friendlyName.getDefaultFriendlyName();
    const typeAndName = new TypeAndName(device);
    name.textContent = await typeAndName.getDeviceName();
    settings.appendChild(name);

    try {
      const dpi = new AdjustableDpi(device);
      const dpiList = await dpi.getDpiList();
      console.log(dpiList);
      const currentDpi = await dpi.getDpi();
      console.log(currentDpi);

      const div = document.createElement('div');
      div.textContent = `DPI: `;

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

      div.appendChild(select);
      settings.appendChild(div);
    } catch { }

    try {
      const reportRate = new ReportRate(device);
      const reportRateList = await reportRate.getReportRateList();
      const currentReportRate = await reportRate.getReportRate();

      const div = document.createElement('div');
      div.textContent = 'Report Rate: ';

      const select = document.createElement('select');
      for (const value of reportRateList) {
        const option = document.createElement('option');
        option.value = value.toString();
        option.innerText = `${value}ms`;
        select.appendChild(option);
      }
      select.value = currentReportRate.toString();
      select.onchange = async () => {
        console.log(select.value);
        await reportRate.setReportRate(parseInt(select.value, 10));
      };

      div.appendChild(select);
      settings.appendChild(div);
    } catch (e) {
      console.error(e);
    }
  }
};
