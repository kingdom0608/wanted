import { Includeable, Op } from "sequelize";

/**
 * 페이지네이션 옵션
 */
export interface FilterToQueryPagination {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  skip?: number;
}

/**
 * 클라이언트 필터를 생성하기 위한 정보
 */
export type PublicFilter = {
  name: string;
  description: string;
  asyncSearchKey?: string;
  type?: string;
  recommend?: string[];
};

/**
 * 컬럼 정보
 * includeAlias: include 정보 매칭
 */
export type FilterToQueryColumn = {
  alias: string;
  key: string;
  includeAlias?: string;
  publicFilter?: PublicFilter;
};

/**
 * include 정보
 */
export type FilterToQueryInclude = {
  alias: string;
  model: any;
  as: string;
  required: boolean;
  separate?: boolean;
  limit?: number;
  include?: FilterToQueryInclude[];
  attributes?: any;
};

/**
 * 쿼리 생성 옵션
 */
export interface FilterToQueryOptions {
  columns: FilterToQueryColumn[];
  include: FilterToQueryInclude[];
}

/**
 * page
 */
export interface FilterToQueryPageQuery {
  filter: object;
  pagination?: FilterToQueryPagination;
  orderBy?: Array<{ field: string; direction: string }>;
  includeAlias?: string;
}

/**
 * 필터를 쿼리로 반환
 */
export class FilterToQuery {
  /** Op 목록 */
  private operators = {
    and: {
      op: Op.and,
    },
    or: {
      op: Op.or,
    },
    between: {
      op: Op.between,
    },
    notBetween: {
      op: Op.notBetween,
    },
    "==": {
      op: Op.eq,
    },
    eq: {
      op: Op.eq,
    },
    "!=": {
      op: Op.ne,
    },
    ne: {
      op: Op.ne,
    },
    "<": {
      op: Op.lt,
    },
    lt: {
      op: Op.lt,
    },
    "<=": {
      op: Op.lte,
    },
    le: {
      op: Op.lte,
    },
    ">": {
      op: Op.gt,
    },
    gt: {
      op: Op.gt,
    },
    ge: {
      op: Op.gte,
    },
    ">=": {
      op: Op.gte,
    },
    like: {
      op: Op.like,
    },
    startsWith: {
      op: Op.startsWith,
    },
    endsWith: {
      op: Op.endsWith,
    },
    contains: {
      op: Op.substring,
    },
    in: {
      op: Op.in,
    },
    not: {
      op: Op.not,
    },
    notIn: {
      op: Op.notIn,
    },
  };
  /** 예약 쿼리 */
  private reserved = {
    isNull: {
      [Op.is]: null,
    },
    eqNull: {
      [Op.eq]: null,
    },
    inNull: {
      [Op.in]: null,
    },
  };

  constructor(private options: FilterToQueryOptions) {}

  /**
   * publicFilter 반환
   */
  getPublicFilters() {
    return this.options.columns
      .filter((column) => !!column.publicFilter)
      .map(({ alias, publicFilter }) => {
        return {
          field: alias,
          ...publicFilter,
        };
      });
  }

  /**
   * 필터 분석
   * @param pageQuery
   * @param authFilter
   */
  parser(pageQuery: FilterToQueryPageQuery, authFilter?: object) {
    if (authFilter) {
      const authFilterKeys = Object.keys(authFilter);
      if (authFilterKeys.includes("and")) {
        /** authFilter `and`키가 있는 경우 pageQuery.filter `and` 조건이 무시됩니다 */
        throw new Error("허용하지 않는 필터");
      }
      if (pageQuery.filter && Object.keys(pageQuery.filter).length > 0) {
        pageQuery.filter = {
          and: {
            and: pageQuery.filter,
            ...authFilter,
          },
        };
      } else {
        pageQuery.filter = authFilter;
      }
    }
    /** 필터 파서 */
    let { where, initIncludeAliases } = this.parseFilter(pageQuery.filter);
    /** 정렬 파서 */
    let order = [];
    if (pageQuery.orderBy) {
      const orderResult = this.mapOrderBy(
        pageQuery.orderBy,
        initIncludeAliases
      );
      initIncludeAliases = initIncludeAliases.concat(
        orderResult.initIncludeAliases
      );
      order = orderResult.order;
    }
    /** pageQuery.includeAlias */
    if (pageQuery.includeAlias) {
      initIncludeAliases.push(pageQuery.includeAlias);
    }
    /** 관련있는 include import */
    let include = [];
    if (initIncludeAliases) {
      /** union array */
      initIncludeAliases = [...new Set(initIncludeAliases)];
      for (const includeAlias of initIncludeAliases) {
        include = this.mapInclude(include, includeAlias);
      }
    }
    /** 페이지네이션 limit, offset 생성 */
    let limit = 9999;
    let offset = 0;
    if (pageQuery.pagination) {
      const { first, skip, after, before, last } = pageQuery.pagination;
      limit = first || limit;
      offset = skip || 0;
      if (after || before || last) {
        throw Error("Cursor 페이지네이션을 지원하지 않습니다");
      }
    }
    return {
      where,
      include,
      initIncludeAliases,
      order,
      limit,
      offset,
    };
  }

  /**
   * OrderBy 정리
   * @param filter
   */
  parseFilter(filter: object = {}) {
    const where = {};
    const initIncludeAliases = [];
    /** 필터 object 순환 */
    for (let [key, value] of Object.entries(filter)) {
      /** Array */
      if (Array.isArray(value)) {
        value = value.map((filter) => {
          if (typeof filter === "object" && !Array.isArray(filter)) {
            const arrayFilterResult = this.parseFilter(filter);
            initIncludeAliases.push(...arrayFilterResult.initIncludeAliases);
            arrayFilterResult.initIncludeAliases.forEach((include) => {
              initIncludeAliases.push(include);
            });
            return arrayFilterResult.where;
          } else {
            return filter;
          }
        });
      }
      /** 하위 object 있는 경우 순환, 배열 제외 */
      if (typeof value === "object" && !Array.isArray(value)) {
        const subResult = this.parseFilter(value);
        value = subResult.where;
        initIncludeAliases.push(...subResult.initIncludeAliases);
      }
      /** filter 해석 op, 정의된 칼럼 할당 */
      const { whereKey, includeAlias } = this.parseKey(key);
      /** 예약된 쿼리 참고 */
      if (this.reserved[value]) {
        value = this.reserved[value];
      }
      where[whereKey] = value;
      /** 관련있는 include import */
      if (includeAlias && !initIncludeAliases.includes(includeAlias)) {
        initIncludeAliases.push(includeAlias);
      }
    }
    return {
      where,
      initIncludeAliases,
    };
  }

  /**
   * GroupByCount 쿼리 생성
   * @param groupFiled
   */
  parseGroupByCount(groupFiled: string) {
    let { key, includeAlias } = this.parseKey(groupFiled);
    const includeKey = includeAlias ? `${includeAlias}.${key}` : key;
    return {
      key,
      includeAlias,
      group: includeKey,
      attributes: [includeKey],
    };
  }

  /**
   * OrderBy 정리
   * @param orderBy
   * @param initIncludeAliases
   */
  mapOrderBy(
    orderBy: Array<{ field: string; direction: string }>,
    initIncludeAliases: string[]
  ) {
    const order = orderBy.map(({ field, direction }) => {
      let keys = [];
      const { key, includeAlias } = this.parseKey(field);
      if (includeAlias && !initIncludeAliases.includes(includeAlias)) {
        initIncludeAliases.push(includeAlias);
      }
      if (includeAlias) {
        keys = includeAlias.split(".");
      }
      keys.push(key);
      return [...keys, direction];
    });
    return {
      initIncludeAliases,
      order,
    };
  }

  /**
   * db include 정리
   * @param include
   * @param includeAlias
   */
  mapInclude(include: Includeable[], includeAlias: string) {
    /**
     * includeAlias 분할 하여
     * this.options.include 깊이 순서대로 include 쌓는다.
     */
    const addIncludes = includeAlias.split(".").map((relationAlias) => {
      const result = this.options.include.find(
        (include) => include.as === relationAlias
      );
      if (!result) {
        throw new Error(`정의되지 않은 Include: ${relationAlias}`);
      }
      return result;
    });
    /**
     * 축적된 addIncludes 역으로 감싸서 관계를 형성한다
     */
    let updateInclude;
    for (const addInclude of addIncludes.reverse()) {
      if (updateInclude) {
        addInclude.include = [];
        addInclude.include.push(updateInclude);
        updateInclude = addInclude;
      } else {
        updateInclude = addInclude;
      }
    }
    /**
     * 정리된 Include를 push하여 반환
     */
    if (updateInclude) {
      include.push(updateInclude);
    }
    return include;
  }

  /**
   * 컬럼 키를 include 쿼리로 요청 가능하게끔 변경
   * @param key
   * @param includeAlias
   */
  parseIncludeKey(key: string, includeAlias: string): string {
    const include = this.options.include.find(
      (include) => include.alias === includeAlias
    );
    if (!include) {
      throw new Error(`정의되지 않은 컬럼: ${includeAlias}`);
    }
    return `$${include.alias}.${key}$`;
  }

  /**
   * 컬럼 key 파서
   * @param key
   */
  parseKey(key: string) {
    /** op 할당 */
    if (this.operators[key]) {
      return {
        key: this.operators[key].op,
        whereKey: this.operators[key].op,
        isColumn: false,
        isOperator: true,
      };
    }
    /** 정의된 칼럼에서 탐색 */
    const col = this.options.columns.find((col) => col.alias === key);
    if (!col) {
      throw new Error(`정의되지 않은 컬럼: ${key}`);
    }
    /** 정의된 칼럼에 include 정보 추가 */
    if (col.includeAlias) {
      return {
        key: col.key,
        whereKey: this.parseIncludeKey(col.key, col.includeAlias),
        isColumn: true,
        isOperator: false,
        includeAlias: col.includeAlias,
      };
    }
    /** 정의된 칼럼에서 정보 반환 */
    return {
      key: col.key,
      whereKey: col.key,
      isColumn: true,
      isOperator: false,
    };
  }
}
