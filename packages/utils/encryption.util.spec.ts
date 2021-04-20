import { expect } from "chai";
import { decrypt, encrypt, encryptPassword } from "./encryption.util";

describe("encryption", () => {
  const plainText = "testEncrypt";
  let encryptText;

  it("EncryptPassword", async () => {
    const result = await encryptPassword.getHash("testEncryptionPassword");
    // console.log(result);
    expect(result.length).to.be.eqls(36);
  });

  it("encrypt", async () => {
    const result = await encrypt.encrypt(plainText);
    encryptText = result;
    // console.log(result);
    expect(result.length).to.be.eqls(44);
  });

  it("decrypt", async () => {
    const result = await decrypt.decrypt(encryptText);
    // console.log(result);
    expect(result).to.be.eqls(plainText);
  });
});
