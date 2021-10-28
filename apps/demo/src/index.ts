import { AdjustableDpi, Hidpp, Receiver, ReportRate, requestDevice, isHidppDevice, TypeAndName, BatteryStatus, Battery, DeviceType, BatteryLevelV4, FeatureSet, BatteryStatusV1 } from "@yume-chan/hidpp";

const root = document.getElementById('root') as HTMLDivElement;

const devices: HIDDevice[] = [];

async function openHidppDevice(device: Hidpp) {
  await device.getVersion();
  console.log(device);

  // Assume all HID++ 1.0 devices are USB receivers
  // (mouses/keyboards started using HID++ 2.0 a long time ago)
  if (device.version === 1) {
    const receiver = new Receiver(device);
    console.log(receiver);

    receiver.onChildConnect(child => openHidppDevice(child));
    await receiver.detectChildren();

    const childrenCount = await receiver.getChildCount();
    console.log('childrenCount', childrenCount);

    return;
  }

  // const friendlyName = new FriendlyName(device);
  // name.textContent = await friendlyName.getDefaultFriendlyName();

  const container = document.createElement('div');

  device.onDisconnect(() => {
    container.remove();
  });

  try {
    const typeAndName = new TypeAndName(device);
    let div = document.createElement('div');
    div.textContent = `${device.index} - ${await typeAndName.getName()}`;
    container.appendChild(div);

    div = document.createElement('div');
    div.textContent = `Type: ${DeviceType[await typeAndName.getType()]}`;
    container.appendChild(div);
  } catch { }

  try {
    const featureSet = new FeatureSet(device);
    const div = document.createElement('div');
    div.textContent = 'Features: ';

    let i = 0;
    for await (const feature of featureSet.getFeatures()) {
      div.textContent += `0x${i.toString(16)}=0x${feature.toString(16).padStart(4, '0')} `;
      i += 1;
    }

    container.appendChild(div);
  } catch { }

  try {
    const battery = new Battery(device);
    const { percentage, nextPercentage, status } = await battery.getBattery();
    console.log('battery', percentage, nextPercentage, status);

    const div = document.createElement('div');
    div.textContent = `Battery: about ${percentage}%, ${BatteryStatus[status]}`;
    container.appendChild(div);
  } catch { }

  try {
    const battery = new Battery(device);
    const { voltage, flags } = await battery.getBatteryV1();
    console.log('battery', voltage, flags, status);

    const div = document.createElement('div');
    div.textContent = `Battery: ${voltage}mV, ${BatteryStatusV1[flags]}`;
    container.appendChild(div);
  } catch { }

  try {
    const battery = new Battery(device);
    const { percentage, level, status } = await battery.getBatteryV4();
    console.log('battery', percentage, level, status);

    const div = document.createElement('div');
    div.textContent = `Battery: ${percentage ? `${percentage}%` : BatteryLevelV4[level]}, ${BatteryStatus[status]}`;
    container.appendChild(div);
  } catch { }

  try {
    const dpi = new AdjustableDpi(device);
    const sensorCount = await dpi.getSensorCount();

    for (let i = 0; i < sensorCount; i += 1) {
      const index = i;

      const dpiList = await dpi.getDpiList(index);
      const currentDpi = await dpi.getDpi(index);

      const div = document.createElement('div');
      div.textContent = `Sensor ${index} DPI: `;

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
        await dpi.setDpi(index, parseInt(select.value, 10));
      };

      div.appendChild(select);
      container.appendChild(div);
    }
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
    container.appendChild(div);
  } catch { }

  root.appendChild(container);
}

async function openHidDevice(device: HIDDevice) {
  if (devices.includes(device)) {
    return;
  }
  devices.push(device);

  console.log(device);
  await openHidppDevice(new Hidpp(device, 0xff));
}

(async () => {
  // Open known devices
  const devices = await navigator.hid.getDevices();
  for (const device of devices) {
    // One physical device may contain multiple HID devices
    // Find the HID device that implements HID++
    if (isHidppDevice(device))
      await openHidDevice(device);
  }
})();

document.getElementById('select-button')!.onclick = async () => {
  const device = await requestDevice();
  if (devices.includes(device)) {
    return;
  }

  console.log(device);
  await openHidDevice(device);
};
