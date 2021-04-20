import {
  AllowNull,
  Column,
  Comment,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { uuidV4 } from "../../../packages/utils/uuid.util";
import { PostReply } from "./PostReply";
import config from "../../../config";

@Table({
  tableName: "Post",
  defaultScope: {
    attributes: [
      "wrn",
      "title",
      "content",
      "status",
      "publisherId",
      "createdAt",
      "updatedAt",
    ],
  },
  scopes: {
    private: {
      attributes: [
        "wrn",
        "title",
        "content",
        "status",
        "publisherId",
        "publisherPassword",
        "createdAt",
        "updatedAt",
      ],
    },
  },
  indexes: [
    {
      fields: ["title"],
      using: "BTREE",
      unique: false,
    },
    {
      fields: ["status"],
      using: "BTREE",
      unique: false,
    },
    {
      fields: ["publisherId"],
      using: "BTREE",
      unique: false,
    },
  ],
})
@Table
export class Post extends Model<Post> {
  @HasMany(() => PostReply)
  postReplies: PostReply[];

  @Comment("wrn")
  @PrimaryKey
  @Default(() => `wrn:${config.get().stage}:post:${uuidV4()}`)
  @Column({
    type: DataType.STRING,
  })
  readonly wrn: string;

  @Comment("제목")
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  title: string;

  @Comment("내용")
  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @Comment("상태")
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  status: string;

  @Comment("작성자 아이디")
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  publisherId: string;

  @Comment("작성자 비밀번호")
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  publisherPassword: string;

  @Comment("생성 일자")
  @AllowNull(false)
  @CreatedAt
  @Column
  createdAt: Date;

  @Comment("업데이트 일자")
  @AllowNull(false)
  @UpdatedAt
  @Column
  updatedAt: Date;
}
