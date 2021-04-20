import { PostSubReply } from "../models";
import { encryptPassword } from "../../../packages/utils/encryption.util";
import {
  FilterToQuery,
  FilterToQueryPageQuery,
} from "../../../packages/utils/filterToQuery.util";

interface ICreatePostSubReplyData {
  postReplyIndex: number;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

export class PostSubReplyService {
  postSubReplyFilter: FilterToQuery;

  constructor() {
    this.postSubReplyFilter = new FilterToQuery({
      columns: [
        {
          alias: "index",
          key: "index",
        },
        {
          alias: "postReplyIndex",
          key: "postReplyIndex",
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
   * service: 게시글 대댓글 생성
   * @param postSubReplyData
   */
  async createPostSubReply(postSubReplyData: ICreatePostSubReplyData) {
    try {
      let postSubReply: PostSubReply = null;

      /** 게시글 대댓글 생성 */
      postSubReply = await PostSubReply.create({
        postReplyIndex: postSubReplyData.postReplyIndex,
        content: postSubReplyData.content,
        status: "ACTIVE",
        publisherId: postSubReplyData.publisherId,
        publisherPassword: encryptPassword.getHash(
          postSubReplyData.publisherPassword
        ),
      });

      return postSubReply.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 대댓글 수 조회
   * @param authFilter
   * @param pageQuery
   */
  async countPostSubReply(
    authFilter: any,
    pageQuery: FilterToQueryPageQuery = { filter: {} }
  ) {
    try {
      /** 필터 추가 */
      const { where, include } = this.postSubReplyFilter.parser(
        pageQuery,
        authFilter
      );

      /** 게시글 대댓글 수 조회 */
      const countPostSubReply = await PostSubReply.count({
        distinct: true,
        where,
        include,
      });

      return countPostSubReply;
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 대댓글 리스트 조회
   * @param authFilter
   * @param pageQuery
   */
  async listPostSubReply(authFilter: any, pageQuery?: FilterToQueryPageQuery) {
    try {
      /** 필터 추가 */
      const {
        where,
        include,
        order,
        limit,
        offset,
      } = this.postSubReplyFilter.parser(pageQuery, authFilter);

      /** 게시글 대댓글 리스트 조회 */
      const postSubReplies = await PostSubReply.findAll({
        subQuery: false,
        where,
        include,
        order,
        limit,
        offset,
      });

      return postSubReplies.map((postSubReply) => postSubReply.toJSON());
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 대댓글 조회
   * @param index
   * @param scope
   */
  async getPostSubReply(index: number, scope?: string) {
    try {
      /** 게시글 대댓글 조회 */
      scope = scope === undefined ? "defaultScope" : scope;
      const postSubReply = await PostSubReply.scope(scope).findOne({
        where: {
          index: index,
        },
      });

      if (postSubReply === null) {
        throw new Error("PostSubReply does not exist");
      }

      return postSubReply.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 대댓글 삭제
   * @param index
   */
  async deletePostSubReply(index: number) {
    try {
      const postSubReply = await this.getPostSubReply(index);

      /** 게시글 대댓글 삭제 */
      await PostSubReply.destroy({
        where: {
          index: index,
        },
      });

      return postSubReply;
    } catch (err) {
      throw err;
    }
  }
}

export const postSubReplyService = new PostSubReplyService();
