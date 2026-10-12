# RFLink button fork

Upstream: https://github.com/ioBroker/ioBroker.rflink

Fork: https://github.com/zonfacter/ioBroker.rflink

Version: 2.1.13-rfbuttons.1, based on upstream 2.1.12.

## Install

Use the versioned `.tgz` artifact. In ioBroker Admin, choose **Adapters → Install from own source → From file**. Update the existing RFLink adapter; keep `rflink.0`, its serial settings and objects. Do not delete the adapter or create a second instance for the same serial port.

The equivalent host command is `iobroker url /absolute/path/iobroker.rflink-2.1.13-rfbuttons.1.tgz rflink`.

Check the installed version and `rflink.0.info.connection` afterward. Set the automatic upgrade policy of **RFLink only** to `none`. Official npm upgrades or reinstallations replace this fork. This does not protect against an explicit manual replacement.

## Controls

Each existing or newly included blind receives `UP_<switch>`, `STOP_<switch>` and `DOWN_<switch>` in its RFLink channel. Existing fixed-command controls with matching device/channel are reused, including the manually installed HTR `UP`, `STOP`, `DOWN` objects.

Write `true` without acknowledgment. The control resets after a successful serial write. Incoming RF frames do not press these buttons. Legacy `BLIND_<switch>` controls remain available. Existing object names are preserved.

Nobily channel bytes `41`–`45` represent channels 1–5; `40` is the separate all-channel selection. Controls for old `BrelMotor` objects still send that old protocol name; the custom BUILD 0A firmware uses `ShutterRemote40`. Include the same remote again under its current protocol rather than assuming old objects work with a different firmware.

## Development and checks

Run `npm ci --ignore-scripts`, `npm run test:buttons`, and `npm run test:package`.
The tests exercise actual adapter startup, automatic migration/inclusion, fixed direction writes, false/ack rejection, serial reset, and UP feedback. They do not move real motors. The upstream full integration suite also requires its ioBroker controller test environment.

Build an artifact with `npm pack --ignore-scripts`. A version tag plus the commit and package SHA-256 identifies a release.

## Maintain

Keep `upstream` pointing to the original project and `origin` to this fork. Fetch upstream changes, review and merge them into a development branch, run checks, increment both package versions and the lockfile version, then build/install a new versioned artifact. Do not blindly run official RFLink updates.

The functional change consists of `lib/blindButtons.js`, the sender/startup/inclusion integration in `main.js`, and the UP decoder correction in `admin/parse.js`. The tests and this documentation are maintained alongside the code. Original MIT license and attribution are retained.

Before replacing the installed adapter, save its package and RFLink object/configuration snapshot. Keep these backups on the ioBroker host. Restore the saved adapter package or files and restart only `rflink.0` if necessary.
