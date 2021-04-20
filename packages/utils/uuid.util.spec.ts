import { expect } from "chai";
import { checkUuid, uuidV4 } from "./uuid.util";

describe("uuid", () => {
  let uuid;
  it("uuidV4", () => {
    const result = uuidV4();
    // console.log(result);
    uuid = result;
    expect(result.length).to.be.eqls(36);
  });

  it("checkUuid", () => {
    const result = checkUuid(uuid);
    // console.log(result);
    expect(result).to.be.eqls(true);
  });
});
