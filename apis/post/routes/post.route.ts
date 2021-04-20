import * as express from "express";
import * as url from "url";
import { postService } from "../services";

export class PostRoute {
  public postRouter: express.Router = express.Router();

  constructor() {
    this.router();
  }

  public router() {
    this.postRouter.post("/post", createPost);
    this.postRouter.get("/posts", listPost);
    this.postRouter.put("/post", updatePost);
    this.postRouter.delete("/post", deletePost);
  }
}

interface ICreatePost {
  title: string;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

interface IUpdatePost {
  wrn: string;
  title?: string;
  content?: string;
  status?: string;
  publisherPassword: string;
}

interface IDeletePost {
  wrn: string;
  publisherPassword: string;
}

/**
 * route: 게시글 생성
 * @param req
 * @param res
 */
async function createPost(req, res) {
  try {
    const body: ICreatePost = req.body;
    const result = await postService.createPost({
      title: body.title,
      content: body.content,
      publisherId: body.publisherId,
      publisherPassword: body.publisherPassword,
    });

    res.send({
      success: true,
      statusCode: 200,
      result: result,
      message: "createPost: 200",
    });
  } catch (err) {
    switch (err.message) {
      case "Invalid publisher password format":
        res.send({
          success: false,
          statusCode: 400,
          message: "createPost: 40001",
        });
        break;
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "createPost: 50000",
        });
        break;
    }
  }
}

/**
 * route: 게시글 리스트 조회
 * @param req
 * @param res
 */
async function listPost(req, res): Promise<void> {
  try {
    const query = url.parse(req.url).query;
    const authFilter = {};
    let queryFilter = {
      filter: {},
    };

    /** 쿼리 파싱 */
    if (query) {
      const parsedQuery = JSON.parse(decodeURIComponent(query));
      if (Object.keys(parsedQuery).length > 0 && parsedQuery.queryFilter) {
        queryFilter = parsedQuery.queryFilter;
      }
    }

    const countPost = await postService.countPost(authFilter, queryFilter);
    const posts = await postService.listPost(authFilter, queryFilter);

    res.send({
      success: true,
      statusCode: 200,
      totalCount: countPost,
      result: posts,
      message: "listPost: 200",
    });
  } catch (err) {
    switch (err.message) {
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "listPost: 50000",
        });
        break;
    }
  }
}

/**
 * route: 게시글 업데이트
 * @param req
 * @param res
 */
async function updatePost(req, res): Promise<void> {
  try {
    const body: IUpdatePost = req.body;

    /** 작성자 비밀번호 일치 여부 */
    const checkPostPublisherPassword = await postService.checkPostPublisherPassword(
      body.wrn,
      body.publisherPassword
    );
    if (checkPostPublisherPassword !== true) {
      throw new Error("Publisher password incorrect");
    }

    const result = await postService.updatePost(body.wrn, {
      title: body.title,
      content: body.content,
      status: body.status,
    });

    res.send({
      success: true,
      statusCode: 200,
      result: result,
      message: "updatePost: 200",
    });
  } catch (err) {
    switch (err.message) {
      case "Publisher password incorrect":
        res.send({
          success: false,
          statusCode: 400,
          message: "updatePost: 40001",
        });
        break;
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "updatePost: 50000",
        });
        break;
    }
  }
}

/**
 * route: 게시글 삭제
 * @param req
 * @param res
 */
async function deletePost(req, res): Promise<void> {
  try {
    const body: IDeletePost = req.body;

    /** 작성자 비밀번호 일치 여부 */
    const checkPostPublisherPassword = await postService.checkPostPublisherPassword(
      body.wrn,
      body.publisherPassword
    );
    if (checkPostPublisherPassword !== true) {
      throw new Error("Publisher password incorrect");
    }

    const result = await postService.deletePost(body.wrn);

    res.send({
      success: true,
      statusCode: 200,
      result: result,
      message: "deletePost: 200",
    });
  } catch (err) {
    switch (err.message) {
      case "Publisher password incorrect":
        res.send({
          success: false,
          statusCode: 400,
          message: "deletePost: 40001",
        });
        break;
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "deletePost: 50000",
        });
        break;
    }
  }
}

export const postRoute: PostRoute = new PostRoute();
