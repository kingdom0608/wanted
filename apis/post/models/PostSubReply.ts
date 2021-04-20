import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  Comment,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { PostReply } from "../models";

@Table({
  tableName: "PostSubReply",
  defaultScope: {
    attributes: [
      "index",
      "postReplyIndex",
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
        "index",
        "postReplyIndex",
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
      fields: ["status"],
      using: "BTREE",
      unique: false,
    },
  ],
})
@Table
export class PostSubReply extends Model<PostSubReply> {
  @BelongsTo(() => PostReply)
  postReply: PostReply;

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
  })
  index: number;

  @Comment("postReplyIndex")
  @ForeignKey(() => PostReply)
  @Column({
    type: DataType.BIGINT,
  })
  postReplyIndex: number;

  @Comment("내용")
  @AllowNull(false)
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
