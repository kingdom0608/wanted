import { expect } from "chai";
import { Op } from "sequelize";
import { FilterToQuery } from "./filterToQuery.util";

describe("FilterToQuery", function () {
  const filterToQuery = new FilterToQuery({
    columns: [
      {
        alias: "test1",
        key: "key1",
        publicFilter: {
          name: "테스트1",
          description: "테스트 필터 입니다",
          recommend: ["hello"],
        },
      },
      {
        alias: "test2",
        key: "key2",
        includeAlias: "re1",
      },
      {
        alias: "test3",
        key: "key3",
        includeAlias: "re1.re2",
      },
    ],
    include: [
      {
        alias: "re1",
        as: "re1",
        model: "Rel1",
        required: true,
      },
      {
        alias: "re1.re2",
        as: "re2",
        model: "Rel2",
        required: true,
      },
      {
        alias: "re1.re2.re3",
        as: "re3",
        model: "Rel3",
        required: false,
      },
    ],
  });

  describe("getClientFilters", function () {
    it("공개 필터 목록", function () {
      const result = filterToQuery.getPublicFilters();
      // console.log(result);
      expect(Object.keys(result[0])).to.be.eqls([
        "field",
        "name",
        "description",
        "recommend",
      ]);
    });
  });

  describe("parseFilter", function () {
    it("다중 and, or 필터 해석", function () {
      const filter = {
        or: {
          test1: "ok",
        },
        and: {
          test1: "ok",
          test2: "ok",
        },
      };
      const result = filterToQuery.parseFilter(filter);
      expect(result).to.be.eqls({
        where: {
          [Op.or]: {
            key1: "ok",
          },
          [Op.and]: {
            key1: "ok",
            "$re1.key2$": "ok",
          },
        },
        initIncludeAliases: ["re1"],
      });
    });

    it("예약 쿼리 해석", function () {
      const filter = {
        test1: "isNull",
        and: {
          test2: "eqNull",
          test3: "inNull",
        },
      };
      const result = filterToQuery.parseFilter(filter);
      // console.log(result);
      expect(result).to.be.eqls({
        where: {
          key1: { [Op.is]: null },
          [Op.and]: {
            "$re1.key2$": { [Op.eq]: null },
            "$re1.re2.key3$": { [Op.in]: null },
          },
        },
        initIncludeAliases: ["re1", "re1.re2"],
      });
    });
  });

  describe("parseGroupByCount", function () {
    it("attributes, group 생성", function () {
      const result = filterToQuery.parseGroupByCount("test1");
      // console.log(result);
      expect(result).to.be.eqls({
        attributes: ["key1"],
        group: "key1",
        includeAlias: undefined,
        key: "key1",
      });
    });

    it("include key 생성", function () {
      const result = filterToQuery.parseGroupByCount("test3");
      // console.log(result);
      expect(result).to.be.eqls({
        attributes: ["re1.re2.key3"],
        group: "re1.re2.key3",
        includeAlias: "re1.re2",
        key: "key3",
      });
    });
  });

  describe("parser", function () {
    it("op, depth1, include1", function () {
      const result = filterToQuery.parser({
        filter: {
          and: {
            test1: "ok",
          },
          or: {
            test2: "ok",
          },
        },
        orderBy: [
          {
            field: "test1",
            direction: "ASC",
          },
        ],
      });
      // console.log(result);
      expect(result).to.be.eqls({
        where: {
          [Op.and]: {
            key1: "ok",
          },
          [Op.or]: {
            "$re1.key2$": "ok",
          },
        },
        limit: 9999,
        offset: 0,
        include: [
          {
            alias: "re1",
            as: "re1",
            model: "Rel1",
            required: true,
          },
        ],
        initIncludeAliases: ["re1"],
        order: [["key1", "ASC"]],
      });
    });

    it("and, or, op 테스트", function () {
      const result = filterToQuery.parser({
        filter: {
          and: {
            test1: "ok",
          },
          or: {
            test2: ["hello", "hi"],
            and: {
              test1: "ee",
              or: {
                test1: {
                  like: "%text%",
                },
              },
            },
          },
        },
      });
      // console.log(result);
      expect(result).to.be.eqls({
        include: [
          {
            alias: "re1",
            as: "re1",
            model: "Rel1",
            required: true,
          },
        ],
        limit: 9999,
        offset: 0,
        initIncludeAliases: ["re1"],
        order: [],
        where: {
          [Op.and]: {
            key1: "ok",
          },
          [Op.or]: {
            "$re1.key2$": ["hello", "hi"],
            [Op.and]: {
              key1: "ee",
              [Op.or]: {
                key1: {
                  [Op.like]: "%text%",
                },
              },
            },
          },
        },
      });
    });

    it("include - and, or, op 테스트", function () {
      const result = filterToQuery.parser({
        filter: {
          or: [
            {
              test1: "test1",
              test2: "ok",
            },
            {
              test2: "hello",
            },
          ],
        },
      });
      // console.log(result);
      expect(result).to.be.eqls({
        include: [
          {
            alias: "re1",
            as: "re1",
            model: "Rel1",
            required: true,
          },
        ],
        limit: 9999,
        offset: 0,
        initIncludeAliases: ["re1"],
        order: [],
        where: {
          [Op.or]: [
            {
              "$re1.key2$": "ok",
              key1: "test1",
            },
            {
              "$re1.key2$": "hello",
            },
          ],
        },
      });
    });

    it("authFilter 테스트", function () {
      const { where } = filterToQuery.parser(
        {
          filter: {
            and: {
              and: {
                and: {
                  test1: {
                    like: "%text%",
                  },
                },
              },
            },
          },
        },
        {
          test1: "hello",
        }
      );
      expect(where).to.be.eqls({
        [Op.and]: {
          key1: "hello",
          [Op.and]: {
            [Op.and]: {
              [Op.and]: {
                [Op.and]: {
                  key1: {
                    [Op.like]: "%text%",
                  },
                },
              },
            },
          },
        },
      });
    });

    it("authFilter 테스트 - 비어있는 필터", function () {
      const { where } = filterToQuery.parser(
        {
          filter: {},
        },
        {
          test1: "hello",
        }
      );
      expect(where).to.be.eqls({
        key1: "hello",
      });
    });

    it("authFilter and 조건 거절", function () {
      try {
        filterToQuery.parser(
          {
            filter: {
              and: {
                and: {
                  and: {
                    test1: {
                      like: "%text%",
                    },
                  },
                },
              },
            },
          },
          {
            and: {
              test1: "hello",
            },
          }
        );
        throw "fail";
      } catch (err) {
        expect(err.message).to.be.eqls("허용하지 않는 필터");
      }
    });
  });

  describe("mapOrderBy", function () {
    it("깊이 1, 깊이 2, 깊이 3", function () {
      const include: any = [];
      const initIncludeAliases: any = [];
      const orderBy = [
        {
          field: "test1",
          direction: "ASC",
        },
        {
          field: "test2",
          direction: "ASC",
        },
        {
          field: "test3",
          direction: "DESC",
        },
      ];
      const result: any = filterToQuery.mapOrderBy(orderBy, initIncludeAliases);
      // console.log(result);
      expect(result).to.be.eqls({
        initIncludeAliases: ["re1", "re1.re2"],
        order: [
          ["key1", "ASC"],
          ["re1", "key2", "ASC"],
          ["re1", "re2", "key3", "DESC"],
        ],
      });
    });
  });

  describe("parserInclude", function () {
    it("깊이 1", function () {
      const includes: any = [];
      const result: any = filterToQuery.mapInclude(includes, "re1");
      // console.log(result);
      expect(result).to.be.eqls([
        {
          alias: "re1",
          as: "re1",
          model: "Rel1",
          required: true,
        },
      ]);
    });

    it("깊이 2", function () {
      const includes: any = [];
      const result: any = filterToQuery.mapInclude(includes, "re1.re2");
      // console.log(result);
      expect(result).to.be.eqls([
        {
          alias: "re1",
          as: "re1",
          model: "Rel1",
          required: true,
          include: [
            {
              alias: "re1.re2",
              as: "re2",
              model: "Rel2",
              required: true,
            },
          ],
        },
      ]);
    });

    it("깊이 3", function () {
      const includes: any = [];
      const result: any = filterToQuery.mapInclude(includes, "re1.re2.re3");
      // console.log(result);
      expect(result).to.be.eqls([
        {
          alias: "re1",
          as: "re1",
          model: "Rel1",
          required: true,
          include: [
            {
              alias: "re1.re2",
              as: "re2",
              model: "Rel2",
              required: true,
              include: [
                {
                  alias: "re1.re2.re3",
                  as: "re3",
                  model: "Rel3",
                  required: false,
                },
              ],
            },
          ],
        },
      ]);
    });
  });
});
