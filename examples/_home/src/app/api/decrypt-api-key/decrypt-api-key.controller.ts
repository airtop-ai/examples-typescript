import type { DecryptApiKeyRequest } from "@/app/api/decrypt-api-key/decrypt-api-key.validation";
import type { LogLayer } from "loglayer";
import nacl from "tweetnacl";
import tweetNaclUtil from "tweetnacl-util";

// Created by running `tweetNaclUtil.encodeBase64(tweetnacl.randomBytes(32))`
const encodedDecryptionKey = process.env.SECRET_FOR_DECRYPTING_API_KEYS;
let decryptionKey: Uint8Array;

function decrypt(encryptedData: string, nonce: string) {
  if (!decryptionKey) {
    if (!encodedDecryptionKey) {
      throw new Error("Decryption key not found.");
    }

    decryptionKey = tweetNaclUtil.decodeBase64(encodedDecryptionKey);
  }

  const encryptedMessage = tweetNaclUtil.decodeBase64(encryptedData); // Decode Base64.
  const decodedNonce = tweetNaclUtil.decodeBase64(nonce); // Decode Base64 nonce.

  // Decrypt the message.
  const decryptedMessage = nacl.secretbox.open(encryptedMessage, decodedNonce, decryptionKey);

  if (!decryptedMessage) {
    throw new Error("Decryption failed. Possible tampering or invalid key.");
  }

  return tweetNaclUtil.encodeUTF8(decryptedMessage); // Convert back to string.
}

interface DecryptApiKeyControllerParams extends DecryptApiKeyRequest {
  log: LogLayer;
}

export async function decryptApiKeyController({ secret, nonce, log }: DecryptApiKeyControllerParams) {
  log.info("Decrypting API key");

  const decryptedApiKey = decrypt(secret, nonce);

  log.info("API key decrypted successfully");

  return {
    apiKey: decryptedApiKey,
  };
}
