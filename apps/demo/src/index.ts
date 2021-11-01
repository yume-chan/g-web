import { AdjustableDpi, Hidpp, Receiver, ReportRate, requestDevice, isHidppDevice, TypeAndName, BatteryStatus, Battery, DeviceType, BatteryLevelV4, FeatureSet, BatteryStatusV1, FirmwareInfo, FirmwareType } from "@yume-chan/hidpp";

const root = document.getElementById('root') as HTMLDivElement;

const devices: HIDDevice[] = [];

async function openHidppDevice(device: Hidpp) {
  await device.getVersion();
  console.log(device);

  // Assume all HID++ 1.0 devices are USB receivers
  // (mouses/keyboards started using HID++ 2.0 since 2013)
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
  root.appendChild(container);

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
  } catch (e) { console.log(e); }

  try {
    const featureSet = new FeatureSet(device);
    const div = document.createElement('div');
    div.textContent = 'Features: ';

    let i = 0;
    for await (const feature of featureSet.getFeatures()) {
      const id = `0x${feature.id.toString(16).padStart(4, '0')}`;
      const div = document.createElement('div');
      const FEATURE_NAMES: Record<string, string> = {
        '0x0000': 'Root',
        '0x0001': 'Feature Set',
        '0x0002': "Feature Info",
        '0x0003': 'Firmware Info',
        '0x0004': 'Device Unit ID',
        '0x0005': 'Device Name',
        '0x0006': 'Device Groups',
        '0x0007': 'Device Friendly Name',
        '0x0008': 'Keep Alive',
        '0x0020': 'Config Change',
        '0x0021': 'Crypto ID',
        '0x0040': 'Target Software',
        '0x0080': 'Wireless Signal Strength',
        '0x00c0': 'DFU Control v0',
        '0x00c1': 'DFU Control v1',
        '0x00c2': 'DFU Control v2',
        '0x00d0': 'DFU',
        '0x1000': 'Battery v0',
        '0x1001': 'Battery v1',
        '0x1004': 'Battery v4',
        '0x1010': 'Charging Control',
        '0x1300': 'LED Control',
        '0x1800': 'Generic Test',
        '0x1802': 'Device Reset',
        '0x1805': 'OOB State',
        '0x1806': 'Configurable Device Properties',
        '0x1014': 'Change Host',
        '0x1015': 'Hosts Info',
        '0x1981': 'Keyboard Backlight v1',
        '0x1982': 'Keyboard Backlight v2',
        '0x1983': 'Keyboard Backlight v3',
        '0x1a00': 'Presenter Control',
        '0x1b00': 'Reprogrammable Control v0',
        '0x1b01': 'Reprogrammable Control v1',
        '0x1b02': 'Reprogrammable Control v2',
        '0x1b03': 'Reprogrammable Control v3',
        '0x1b04': 'Reprogrammable Control v4',
        '0x1bc0': 'Report HID Usages',
        '0x1c00': 'Persistent Remappable Action',
        '0x1d4b': 'Wireless Status',
        '0x1df0': 'Remaining Pairing',
        '0x1e00': 'Enable Hidden Features',
        '0x1f1f': 'Firmware Properties',
        '0x0f20': 'ADC Measurement',
        '0x2001': 'Button Swap',
        '0x2005': 'Button Swap Cancel',
        '0x2006': 'Pointer Axis Orientation',
        '0x2100': 'Vertical Scrolling',
        '0x2110': 'Smart Shift v0',
        '0x2111': 'Smart Shift v1',
        '0x2120': 'Hi-Res Wheel v0',
        '0x2121': 'Hi-Res Wheel v1',
        '0x2130': 'Ratchet Wheel',
        '0x2150': 'Thumb Wheel',
        '0x2200': 'Mouse Pointer',
        '0x2201': 'Adjustable DPI',
        '0x2205': 'Pointer Motion Scaling',
        '0x2230': 'Angle Snapping',
        '0x2240': 'Surface Tuning',
        '0x2250': 'XY Stats',
        '0x2251': 'Wheel Stats',
        '0x2400': 'Hybrid Tracking',
        '0x40a0': 'Fn Inversion v0',
        '0x40a2': 'Fn Inversion v2',
        '0x40a3': 'Fn Inversion v3',
        '0x4100': 'Encryption',
        '0x4220': 'Lock Key State',
        '0x4301': 'Solar Dashboard',
        '0x4520': 'Keyboard Layout',
        '0x4521': 'Disable Keys',
        '0x4522': 'Disable Keys By Usage',
        '0x4530': 'Dual Platform',
        '0x4531': 'Multi Platform',
        '0x4540': 'Keyboard Layout 2',
        '0x4600': 'Crown',
        '0x6010': 'TouchPad Firmware Items',
        '0x6011': 'TouchPad Software Items',
        '0x6012': 'TouchPad Windows 8 Firmware Items',
        '0x6020': 'Tap Enabled v0',
        '0x6021': 'Tap Enabled v1',
        '0x6030': 'Cursor Ballistic',
        '0x6040': 'TouchPad Resolution',
        '0x6100': 'TouchPad Raw XY',
        '0x6110': 'Touch Mouse Raw Points',
        '0x6500': 'TouchPad Gestures v0',
        '0x6501': 'TouchPad Gestures v1',
        '0x8040': 'Brightness Control',
        '0x8060': 'Adjustable Report Rate',
        '0x8070': 'Color LED Effects',
        '0x8071': 'RGB Effects',
        '0x8080': 'Per Key Lighting v0',
        '0x8081': 'Per Key Lighting v1',
        '0x8090': 'Mode Status',
        '0x8100': 'On-board Profiles',
        '0x8110': 'Mouse Button Spy',
        '0x8111': 'Latency Monitoring',
        '0x8120': 'Gaming Attachments',
        '0x8123': 'Force Feedback',
        '0x8300': 'Side Tone',
        '0x8310': 'Equalizer',
        '0x8320': 'Headset Out',
      };
      const flags: string[] = [];
      if (feature.obsolete) {
        flags.push('obsolete');
      }
      if (feature.hidden) {
        flags.push('hidden');
      }
      if (feature.internal) {
        flags.push('internal');
      }
      div.textContent = `Feature 0x${i.toString(16)}: ${id}${FEATURE_NAMES[id] ? ` ${FEATURE_NAMES[id]}` : ''}${flags.length ? ` (${flags.join(', ')})` : ''}`;
      container.appendChild(div);
      i += 1;
    }
  } catch (e) { console.log(e); }

  try {
    const firmwareInfo = new FirmwareInfo(device);
    const deviceInfo = await firmwareInfo.getDeviceInfo();
    console.error(deviceInfo);
    for (let i = 0; i < deviceInfo.entityCount; i += 1) {
      const firmware = await firmwareInfo.getFirmwareInfo(i);
      const div = document.createElement('div');
      div.textContent = [
        `Firmware ${i}:`,
        FirmwareType[firmware.type] ?? 'Unknown',
        firmware.name,
        `${firmware.major.toString(16)}.${firmware.minor.toString(16)}.${firmware.build.toString(16)}`,
        firmware.active ? ' (active)' : '',
        firmware.pid ? ` pid=${firmware.pid.toString(16).padStart(2, '0')}` : '',
      ].filter(Boolean).join(' ');
      container.appendChild(div);
    }

    let serialNumber = deviceInfo.unitId.toString(16).padStart(8, '0');
    if (deviceInfo.supportSerialNumber) {
      serialNumber = await firmwareInfo.getSerialNumber();
    }
    const div = document.createElement('div');
    div.textContent = `Serial Number: ${serialNumber}`;
    container.appendChild(div);
  } catch (e) { console.error(e); }

  try {
    const battery = new Battery(device);
    const { percentage, nextPercentage, status } = await battery.getBattery();
    console.log('battery', percentage, nextPercentage, status);

    const div = document.createElement('div');
    div.textContent = `Battery: about ${percentage}%, ${BatteryStatus[status]}`;
    container.appendChild(div);
  } catch (e) { console.log(e); }

  try {
    const battery = new Battery(device);
    const { voltage, flags } = await battery.getBatteryV1();
    console.log('battery', voltage, flags);

    // curve fit from https://drive.google.com/file/d/1F_fuqL0-TbZ77u0suXRcj3YcDidCcN1M/view
    const soc = ((x) => 11.111 * x ** 6 - 33.484 * x ** 5 + 37.664 * x ** 4 - 18.819 * x ** 3 + 3.9504 * x ** 2 + 0.1167 * x + 3.6363)(voltage);

    const div = document.createElement('div');
    div.textContent = `Battery: ${voltage}mV (~${soc}%), ${BatteryStatusV1[flags] ?? 'Discharging'}`;
    container.appendChild(div);
  } catch (e) { console.log(e); }

  try {
    const battery = new Battery(device);
    const { percentage, level, status } = await battery.getBatteryV4();
    console.log('battery', percentage, level, status);

    const div = document.createElement('div');
    div.textContent = `Battery: ${percentage ? `${percentage}%` : BatteryLevelV4[level]}, ${BatteryStatus[status]}`;
    container.appendChild(div);
  } catch (e) { console.log(e); }

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
  } catch (e) { console.log(e); }

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
  } catch (e) { console.log(e); }
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
