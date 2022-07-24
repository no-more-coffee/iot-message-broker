# IoT message broker

A simplified version of our Connector (Mini-Connector) and some devices.

![Diagram](/diagram.png)

# Development

Prerequisites:

- node
- ts-node

Run mini-broker:

```
cd mini-broker
npm install
ts-node src/server.ts
```

Run passive device:

```
cd device
npm install
IS_PASSIVE=true ts-node src/client.ts
```

Run active device:

```
cd device
npm install
IS_PASSIVE=false ts-node src/client.ts
```

# Production

Prerequisites:

- node
- typescript
- docker

Build:

```
docker compose build
```

Run:

```
docker compose up
```

# User interaction

Prerequisites:

- node
- ts-node

List connected devices:

```
# From `mini-broker` directory
ts-node src/ws-client.ts list
```

Disable active device probing:

```
# From `mini-broker` directory
ts-node src/ws-client.ts disable <device id>
```

Enable active device probing:

```
# From `mini-broker` directory
ts-node src/ws-client.ts enable <device id>
```

# Checklist

- [x] Implement at least two devices of any type (passive and/or active)
- [x] Devices have a unique ID. (MQTT send client.id)
- [x] Devices generate periodically changing pseudorandom.
- [x] Mini-Connector should dynamically detect available devices.
- [x] Use TypeScript.
- [x] Establish a secure connection between devices and the Mini-Connector.
- [x] Validate device messages using any form of checksum.
- [x] The Mini-Connector accepts user-input to interact with the devices.
- [ ] The Mini-Connector manages the process-lifecycle of the devices. It can start and stop
      devices dynamically.
