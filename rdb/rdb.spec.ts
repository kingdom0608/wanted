import { expect } from "chai";
import { connection, sync } from "./connect";

before(async () => {
  await connection();
});

/** 데이터베이스 테이블 삭제 테스트이므로 사용전 확인 후 사용 */
describe("rdb sync", async function () {
  it("rdb sync", async () => {
    const result = await sync();
    expect(result).eqls("sync success");
  });
});

describe("rdb seed", async function () {});
