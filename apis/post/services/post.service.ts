import { Post, PostReply } from "../models";
import { encryptPassword } from "../../../packages/utils/encryption.util";
import {
  FilterToQuery,
  FilterToQueryPageQuery,
} from "../../../packages/utils/filterToQuery.util";

interface ICreatePostData {
  title: string;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

interface IUpdatePostData {
  title?: string;
  content?: string;
  status?: string;
}

export class PostService {
  postFilter: FilterToQuery;

  constructor() {
    this.postFilter = new FilterToQuery({
      columns: [
        {
          alias: "wrn",
          key: "wrn",
        },
        {
          alias: "title",
          key: "title",
          publicFilter: {
            name: "제목",
            description: "제목",
          },
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
   * service: 게시글 작성자 비밀번호 일치 여부
   * @param wrn
   * @param publisherPassword
   */
  async checkPostPublisherPassword(wrn: string, publisherPassword: string) {
    try {
      const post: any = await this.getPost(wrn, "private");
      return (
        post.publisherPassword === encryptPassword.getHash(publisherPassword)
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 생성
   * @param postData
   */
  async createPost(postData: ICreatePostData) {
    try {
      let post: Post = null;

      /** 게시글 생성 */
      post = await Post.create({
        title: postData.title,
        content: postData.content,
        status: "ACTIVE",
        publisherId: postData.publisherId,
        publisherPassword: encryptPassword.getHash(postData.publisherPassword),
      });

      return post.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 수 조회
   * @param authFilter
   * @param pageQuery
   */
  async countPost(
    authFilter: any,
    pageQuery: FilterToQueryPageQuery = { filter: {} }
  ) {
    try {
      /** 필터 추가 */
      const { where, include } = this.postFilter.parser(pageQuery, authFilter);

      /** 게시글 수 조회 */
      const countPost = await Post.count({
        distinct: true,
        where,
        include,
      });

      return countPost;
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 리스트 조회
   * @param authFilter
   * @param pageQuery
   */
  async listPost(authFilter: any, pageQuery: FilterToQueryPageQuery) {
    try {
      /** 필터 추가 */
      const { where, include, order, limit, offset } = this.postFilter.parser(
        pageQuery,
        authFilter
      );

      /** 게시글 리스트 조회 */
      const posts = await Post.findAll({
        subQuery: false,
        where,
        include,
        order,
        limit,
        offset,
      });

      return posts.map((post) => post.toJSON());
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 조회
   * @param wrn
   * @param scope
   */
  async getPost(wrn: string, scope?: string) {
    try {
      /** 게시글 조회 */
      scope = scope === undefined ? "defaultScope" : scope;
      const post = await Post.scope(scope).findOne({
        where: {
          wrn: wrn,
        },
        include: [
          {
            attributes: [
              "index",
              "postWrn",
              "content",
              "status",
              "publisherId",
              "createdAt",
              "updatedAt",
            ],
            model: PostReply,
          },
        ],
      });

      if (post === null) {
        throw new Error("Post does not exist");
      }

      return post.toJSON();
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 업데이트
   * @param wrn
   * @param postData
   */
  async updatePost(wrn: string, postData: IUpdatePostData) {
    try {
      /** 게시글 업데이트 */
      await Post.update(postData, {
        where: {
          wrn: wrn,
        },
      });

      return await this.getPost(wrn);
    } catch (err) {
      throw err;
    }
  }

  /**
   * service: 게시글 삭제
   * @param wrn
   */
  async deletePost(wrn: string) {
    try {
      /** 게시글 조회 */
      const post = await this.getPost(wrn);

      /** 게시글 삭제 */
      await Post.destroy({
        where: {
          wrn: wrn,
        },
      });

      return post;
    } catch (err) {
      throw err;
    }
  }
}

export const postService = new PostService();
