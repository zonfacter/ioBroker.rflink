![Logo](admin/rflink.png)
# ioBroker.rflink

![Number of Installations](http://iobroker.live/badges/rflink-installed.svg) ![Number of Installations](http://iobroker.live/badges/rflink-stable.svg) [![NPM version](http://img.shields.io/npm/v/iobroker.rflink.svg)](https://www.npmjs.com/package/iobroker.rflink)
[![Downloads](https://img.shields.io/npm/dm/iobroker.rflink.svg)](https://www.npmjs.com/package/iobroker.rflink)
[![Tests](https://travis-ci.org/ioBroker/ioBroker.rflink.svg?branch=master)](https://travis-ci.org/ioBroker/ioBroker.rflink)

[![NPM](https://nodei.co/npm/iobroker.rflink.png?downloads=true)](https://nodei.co/npm/iobroker.rflink/)

This adapter communicates with [rflink](http://www.nemcon.nl/blog2/) build on arduino mega and RFC 433MHz/866MHz/2.6Gz communication.
Used for receiving the data from weather sensors and wireless power switches.

## RFLink buttons fork

This fork adds separate momentary UP, STOP and DOWN controls to each included blind channel. Existing blind states and user names are kept. Controls are created automatically at adapter startup and when a new blind is included. An incoming UP command now sets the legacy blind feedback to true, while DOWN sets it to false.

Example: `rflink.0.channels.ShutterRemote40_1.UP_41`, `STOP_41`, `DOWN_41`.
Write `true` with `ack=false` to trigger a button. A successful serial write resets it to `false` with `ack=true`; this does not confirm motor movement. False and acknowledged writes never trigger these buttons. Previously created short HTR controls (`UP`, `STOP`, `DOWN`) are reused.

Firmware decodes RF telegrams. This adapter stores external device/channel assignments and creates controls. The currently tested HTR008W firmware uses a local profile alias; this adapter does not turn it into a universal HTR decoder.

This is a separately maintained fork, not an official npm release. Install a versioned package from this repository. Keep automatic RFLink upgrades disabled (`automaticUpgrade: none`) and merge upstream updates deliberately. Installing the official npm package replaces the fork. See [FORK.md](FORK.md) for installation and maintenance.

## Prerequires
To use serial port on Windows it is VS required to build the binary.
To use serial port on linux it is build-essential required. To install it just write:

```
sudo apt-get update
sudo apt-get install build-essential -y
```

## Usage
To enable the learning of sensors you must activate "Inclusion mode". The inclusion mode by default will be enabled for 5 minutes (300000 ms) and after 5 minutes will be disabled automatically.

To enable inclusion mode forever, just set "Inclusion timeout" to 0.

## Pair
The devices get the new address every time the battery changed.

So after the battery changed it must be learned anew.

To do that press the pair button just before inserting the battery and the device will be learned with new address.

## Auto pairing
If you have not so many sensors in the near you can activate auto re-pairing.

It is possible only if the device can be definitely identified.

That means that only one device with this brand and type is present. (E.g. only one temperature sensor from one brand)

If system detect more than one device with such a parameter it will automatically deactivate the auto re-pairing mode and indicate problem sensors with flash.

## Send raw commands
The user has the possibility to send raw commands to device. Just write you command in form described [here](http://www.nemcon.nl/blog2/protref).

E.g: ```10;AB400D;00004d;1;OFF;```. Please read documentation to understand the commands.

<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->

## Changelog

### 2.1.13-rfbuttons.1 (2026-10-12)
* Add automatic per-channel blind buttons, migration, button reset and correct UP feedback.

### **WORK IN PROGRESS**
- (copilot) Adapter requires node.js >= 22 now

### 2.1.12 (2024-06-12)
* (foxriver76) fix serialport

### 2.1.8 (2024-06-11)
* (foxriver76) upgrade serialport

### 2.1.7 (2024-06-11)
* (foxriver76) ensured js-controller v6 compatibility

### 2.1.6 (2020-09-25)
* (evanes68) The reconnect on the disconnection was added
* (bluefox) Compact mode was implemented

### 2.1.5 (2020-05-04)
* (Apollon77) optimize rebuild handling if needed

### 2.1.2 (2020-05-02)
* (Apollon77) getting port list works again 

### 2.1.0 (2020-04-24)
* (Apollon77) nodejs 6 is no longer supported!

### 2.0.0 (2019-05-15)
* (Apollon77) Support for nodejs 12 added, nodejs 4 is no longer supported!

### 1.2.0 (2018-01-23)
* (Apollon77) Upgrade Serialport Library

### 1.1.6 (2017-10-08)
* (Apollon77) Fix parsing for Wind-Direction

### 1.1.5 (2017-05-23)
* (Apollon77) Upgrade Serialport Library for compatibility to node 6.x

### 1.1.4 (2017-04-15)
* (bluefox) Fix the rain calculation

### 1.1.3 (2017-04-11)
* (bluefox) Allow flash on node.js < 5

### 1.1.2 (2017-04-10)
* (bluefox) Fix the wind gist calculation

### 1.1.0 (2017-02-03)
* (bluefox) Add stop for blinds

### 1.0.8 (2017-01-20)
* (bluefox) fix KWATT calculation for Oregon CM180

### 1.0.6 (2016-12-15)
* (bluefox) Support of raw commands
* (bluefox) Support MiLightv1 commands
* (Apollon77) update serialport library for node 6.x compatibility

### 1.0.5 (2016-11-11)
* (bluefox) Read newest sketch from web

### 1.0.2 (2016-10-23)
* (bluefox) Flashing of sketch into arduino
* (bluefox) Set_level from 1 to 15
* (bluefox) show version of sketch

### 0.2.1 (2016-10-19)
* (bluefox) Fix for SET_LEVEL

### 0.2.0 (2016-10-18)
* (bluefox) Fix write of commands

### 0.1.4 (2016-10-18)
* (bluefox) Fix the last changed time indication

### 0.1.3 (2016-10-17)
* (bluefox) initial commit

[Older changelogs can be found there](CHANGELOG_OLD.md)
