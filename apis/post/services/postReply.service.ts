import { PostReply, PostSubReply } from "../models";
import { encryptPassword } from "../../../packages/utils/encryption.util";
import {
  FilterToQuery,
  FilterToQueryPageQuery,
} from "../../../packages/utils/filterToQuery.util";
import { postSubReplyService } from "./postSubReply.service";

interface ICreatePostReplyData {
  postWrn: string;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

export class PostReplyService {
  postReplyFilter: FilterToQuery;

  constructor() {
    this.postReplyFilter = new FilterToQuery({
      columns: [
        {
          alias: "index",
          key: "index",
        },
        {
          alias: "postWrn",
          key: "postWrn",
        },
        {
          alias: "content",
          key: "content",
        },
        {
          alias: "status",
          key: "status",
        },
        {
          alias: "publisherId",
          key: "publisherId",
          publicFilter: {
            name: "작성자 아이디",
            description: "작성자 아이디",
          },
        },
        {
          alias: "createdAt",
          key: "createdAt",
        },
        {
          alias: "updatedAt",
          key: "updatedAt",
        },
      ],
      include: [],
    });
  }

  /**
   * service: 게시글 댓글 생성
   * @param postReplyData
   */
  async createPostReply(postReplyData: ICreatePostReplyData) {
    try {
      let postReply: PostReply = null;

      /** 게시글 댓글 생성 */
      postReply = await PostReply.create({
        postWrn: postReplyData.postWrn,
        content: postReplyData.content,
        status: "ACTIVE",
        publisherId: postReplyData.publisherId,
        publisherPassword: encryptPassword.getHash(
          postReplyData.publisherPassword
        ),
      });

      return postReply.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 댓글 수 조회
   * @param authFilter
   * @param pageQuery
   */
  async countPostReply(
    authFilter: any,
    pageQuery: FilterToQueryPageQuery = { filter: {} }
  ) {
    try {
      /** 필터 추가 */
      const { where, include } = this.postReplyFilter.parser(
        pageQuery,
        authFilter
      );

      /** 게시글 댓글 수 조회 */
      const countPostReply = await PostReply.count({
        distinct: true,
        where,
        include,
      });

      return countPostReply;
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 댓글 리스트 조회
   * @param authFilter
   * @param pageQuery
   */
  async listPostReply(authFilter: any, pageQuery?: FilterToQueryPageQuery) {
    try {
      /** 필터 추가 */
      const {
        where,
        include,
        order,
        limit,
        offset,
      } = this.postReplyFilter.parser(pageQuery, authFilter);

      /** 게시글 댓글 리스트 조회 */
      const postReplies = await PostReply.findAll({
        subQuery: false,
        where,
        include,
        order,
        limit,
        offset,
      });

      return postReplies.map((postReply) => postReply.toJSON());
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 댓글 조회
   * @param index
   * @param scope
   */
  async getPostReply(index: number, scope?: string) {
    try {
      /** 게시글 댓글 조회 */
      scope = scope === undefined ? "defaultScope" : scope;
      const postReply = await PostReply.scope(scope).findOne({
        where: {
          index: index,
        },
        include: [
          {
            attributes: [
              "index",
              "postReplyIndex",
              "content",
              "status",
              "publisherId",
              "createdAt",
              "updatedAt",
            ],
            model: PostSubReply,
          },
        ],
      });

      if (postReply === null) {
        throw new Error("PostReply does not exist");
      }

      return postReply.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 댓글 삭제
   * @param index
   */
  async deletePostReply(index: number) {
    try {
      const postReply = await this.getPostReply(index);

      /** 게시글 댓글 삭제 */
      await PostReply.destroy({
        where: {
          index: index,
        },
      });

      return postReply;
    } catch (err) {
      throw err;
    }
  }
}

export const postReplyService = new PostReplyService();
