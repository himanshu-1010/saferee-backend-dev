const CryptoJS = require("crypto-js");
const { jsonString } = require("./utilsLib");

//Generate Key
const generateKey = () => {
  try {
    const passPhrase = process?.env?.ENC_SALT_PASS_PHRASE || "";
    const key = CryptoJS?.PBKDF2(passPhrase, CryptoJS?.enc?.Hex?.parse(process?.env?.ENC_SALT_KEY), {
      keySize: 8,
      iterations: 1000,
    });
    return key;
  } catch (error) {
    throw error;
  }
};

// Function for AES 256 Encryption
exports.encryptString = (data = "") => {
  try {
    if(data?.length > 0) {
      const key = generateKey();
      const ivKey = process?.env?.ENC_DEC_IV || "";
      const encrypted = CryptoJS?.AES?.encrypt(data, key, { iv: CryptoJS?.enc?.Hex?.parse(ivKey) });
      return encrypted?.ciphertext?.toString(CryptoJS?.enc?.Base64);
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

// Function for  AES 256 Decryption
exports.decryptString = (data = "") => {
  try {
    if(data?.length > 0) {
      const key = generateKey();
      const ivKey = process?.env?.ENC_DEC_IV || "";
      const params = CryptoJS?.lib?.CipherParams?.create({ ciphertext: CryptoJS?.enc?.Base64?.parse(data) });
      const decrypted = CryptoJS?.AES?.decrypt(params, key, { iv: CryptoJS?.enc?.Hex?.parse(ivKey) });
      const decData = decrypted?.toString(CryptoJS?.enc?.Utf8);
      return jsonString(decData);
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};