import crypto from "crypto";

export function createChecksum(data: Buffer): Buffer {
  return crypto.createHash("md5").update(data).digest();
}

export function packMessage(data: object): Buffer {
  const bufferedData = Buffer.from(JSON.stringify(data));
  const checksum = createChecksum(bufferedData);
  return Buffer.concat([checksum, bufferedData]);
}

export function unpackMessage(message: Buffer | string) {
  if (typeof message === "string") {
    message = Buffer.from(message);
  }

  try {
    const receivedChecksum = message.subarray(0, 16);
    const data = message.subarray(16);
    const calculatedChecksum = createChecksum(data);
    if (!calculatedChecksum.equals(receivedChecksum)) {
      console.error(
        `Invalid checksum. Received: ${receivedChecksum}. Calculated: ${calculatedChecksum}.`
      );
      return null;
    }
    return JSON.parse(data.toString());
  } catch (err) {
    console.error("Failed to parse message:", message, err);
  }
  return null;
}
