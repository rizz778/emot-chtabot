import { encryptMessage, decryptMessage } from "./encrypt.js";

const text = "Hello, Secure World!";
const encrypted = encryptMessage(text);
console.log("Encrypted:", encrypted);

const decrypted = decryptMessage(encrypted.encryptedData, encrypted.iv, encrypted.authTag);
console.log("Decrypted:", decrypted);
