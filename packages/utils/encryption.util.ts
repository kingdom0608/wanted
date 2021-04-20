import * as CryptoJS from "crypto-js";
import * as pbkdf2 from "pbkdf2";
import config from "../../config";

/** salt 값 */
const salt = config.get().encrypt.salt;

/** 암호화 횟수 */
let iterations = 5;

/** 암호화 길이 */
let keyLength = 18;

/** 암호화 방식 */
let digest = config.get().encrypt.digest;

class EncryptPassword {
  getHash(password): string {
    let derivedKey = pbkdf2.pbkdf2Sync(
      password,
      salt,
      iterations,
      keyLength,
      digest
    );
    return derivedKey.toString("hex");
  }
}

class Encrypt {
  encrypt(text: string) {
    return CryptoJS.AES.encrypt(text, salt).toString();
  }
}

class Decrypt {
  decrypt(text: string) {
    let bytes = CryptoJS.AES.decrypt(text.toString(), salt);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

export const encryptPassword: EncryptPassword = new EncryptPassword();
export const encrypt: Encrypt = new Encrypt();
export const decrypt: Decrypt = new Decrypt();
