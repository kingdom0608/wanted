import { Model, Sequelize } from "sequelize-typescript";

/**
 * Rdb Options
 */
export interface IRdbOptions {
  stage: string;
  connection: IRdbOptionsConnection;
  databasePrefix?: string;
  databasePrefixSeparator?: string;
  /** IRdbOptionsConnection 에 있을 경우 나머지 정보를 모두 넣어야 하므로 모두 Optional 한 곳으로 이동 */
  logging?: boolean | Function;
}

export interface IRdbOptionsConnection {
  host: string;
  user: string;
  password: string;
  logging?: boolean;
}

export class Rdb {
  sequelize: any;
  isSync: boolean;

  constructor(
    database: string,
    models: Array<typeof Model>,
    private options: IRdbOptions
  ) {
    const rdbConnection: IRdbOptionsConnection = options.connection;
    let prefix =
      options.stage === "local" || options.stage === "test"
        ? "local"
        : options.stage;
    let separator = options.databasePrefixSeparator
      ? options.databasePrefixSeparator
      : "-";
    prefix =
      options.databasePrefix !== undefined ? options.databasePrefix : prefix;
    database = prefix + separator + database;

    /**
     * Sequelize Logging Option 수정
     * rdbConnection 에 있을 경우
     * @param loggingOption
     * @returns {boolean | Function}
     */
    const loggingOption: boolean | Function = (loggingOption) => {
      let retValue;
      if (loggingOption === undefined) {
        retValue = false;
      } else if (loggingOption === true) {
        retValue = console.log;
      } else {
        retValue = loggingOption;
      }
      return retValue;
    };
    const sequelizeOptions: any = {
      dialect: "mysql",
      database: database,
      host: rdbConnection.host,
      username: rdbConnection.user,
      password: rdbConnection.password,
      timezone: "+09:00",
      logging: console.log,
      dialectOptions: {
        decimalNumbers: true,
      },
      pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 1000,
      },
    };
    this.sequelize = new Sequelize(sequelizeOptions);
    this.sequelize.addModels(models);
    this.isSync = false;
  }

  /**
   * database 스킴 alter
   * 테이블을 모델에 맞게 변경합니다. 프로덕션 용도로 권장되지 않습니다. 모델에서 제거되었거나 유형이 변경된 열의 데이터를 삭제합니다.
   * @returns {Promise<void>}
   */
  async alter(): Promise<void> {
    if (!this.isSync) {
      await this.sequelize.sync({
        alter: true,
      });
      this.isSync = true;
    }
  }

  /**
   * database sync
   * http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-method-sync
   * @returns {Promise<void>}
   */
  async sync(options: { force: boolean } = { force: false }): Promise<void> {
    if (!this.isSync) {
      if (options.force) {
        if (
          this.options.connection.host === "dv" ||
          this.options.connection.host === "prod"
        ) {
          throw new Error("WARN: LOCAL DATABASE ONLY");
        }
      }
      await this.sequelize.sync(options);
    }
  }

  /**
   * database reset
   * 주의: 데이터베이스를 삭제하고 새로 생성
   * @returns {Promise<void>}
   */
  async reset(confirmString: string): Promise<void> {
    if (
      this.options.connection.host === "dv" ||
      this.options.connection.host === "prod"
    ) {
      throw new Error("WARN: LOCAL DATABASE ONLY");
    }
    if (confirmString !== "WARN: DATABASE RESET") {
      throw new Error("WARN: DATABASE RESET");
    }
    if (!this.isSync) {
      await this.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      try {
        await this.sequelize.sync({
          force: true,
        });
      } catch (err) {
        console.error(err);
      }
      await this.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
      this.isSync = true;
    }
  }
}
