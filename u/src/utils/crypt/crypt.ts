import CryptoJS from 'crypto-js';

export const encryptAndEncode = (data: string, secretKey: string) => {
    console.log('encryptAndEncode', data, 'secretKey', secretKey);
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encodeURIComponent(encrypted);
};

export const decodeAndDecrypt = (cipherText: string, secretKey: string) => {
    const decodedCipherText = decodeURIComponent(cipherText);
    const bytes = CryptoJS.AES.decrypt(decodedCipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};
