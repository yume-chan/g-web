# G-Web

A Logitech™ device manager in browsers. It uses WebHID API to interact with devices connected via USB (corded or through receivers) or Bluetooth.

G-Web is not a official product of Logitech.

Current state:

![image](doc/screenshot.png)

## Limitations

1. Due to security concerns, it can't detect and connect to devices automatically. Users must select their devices from a browser-provided popup to permit the connection.
2. Because it runs in browser, it won't support certain custom key mapping features like macro or launching programs.

## Roadmap

### General

- [x] Device name
- [ ] Battery level
- [ ] Receiver pairing

### Mouse

- [x] DPI (no multiple DPI)
- [x] Report rate
- [ ] Button remapping

### Keyboard

> I don't have a Logitech keyboard so no feature planned.

## Thanks

* [Logitech Official Documentations](http://drive.google.com/folderview?id=0BxbRzx7vEV7eWmgwazJ3NUFfQ28)
* [Solaar](https://github.com/pwr-Solaar/Solaar): A Logitech device manager for Linux.
