import { createChecksum, packMessage, unpackMessage } from "./message";

test("good message", () => {
  const message = { hello: "HELLLooo" };
  const digest = packMessage(message);
  let unpackedMessage = unpackMessage(digest);

  expect(unpackedMessage).toStrictEqual(message);
});

test("bad data", () => {
  const bufferedData = Buffer.from("Some string");
  const checksum = createChecksum(bufferedData);
  const digest = Buffer.concat([checksum, bufferedData]);

  let unpackedMessage = unpackMessage(digest);

  expect(unpackedMessage).toStrictEqual(null);
});

test("bad checksum", () => {
  const message = { hello: "HELLLooo" };
  const bufferedData = Buffer.from(JSON.stringify(message));
  const checksum = Buffer.from("Nonsense data");
  const digest = Buffer.concat([checksum, bufferedData]);

  let unpackedMessage = unpackMessage(digest);

  expect(unpackedMessage).toStrictEqual(null);
});
