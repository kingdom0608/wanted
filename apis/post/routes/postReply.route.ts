import * as express from "express";
import * as url from "url";
import { postReplyService } from "../services";

export class PostReplyRoute {
  public postReplyRouter: express.Router = express.Router();

  constructor() {
    this.router();
  }

  public router() {
    this.postReplyRouter.post("/postReply", createPostReply);
    this.postReplyRouter.get("/postReplies/postWrn/:postWrn", listPostReply);
  }
}

interface ICreatePostReply {
  postWrn: string;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

/**
 * route: 게시글 댓글 생성
 * @param req
 * @param res
 */
async function createPostReply(req, res) {
  try {
    const body: ICreatePostReply = req.body;
    const result = await postReplyService.createPostReply({
      postWrn: body.postWrn,
      content: body.content,
      publisherId: body.publisherId,
      publisherPassword: body.publisherPassword,
    });

    res.send({
      success: true,
      statusCode: 200,
      result: result,
      message: "createPostReply: 200",
    });
  } catch (err) {
    switch (err.message) {
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "createPostReply: 50000",
        });
        break;
    }
  }
}

/**
 * route: 게시글 댓글 리스트 조회
 * @param req
 * @param res
 */
async function listPostReply(req, res): Promise<void> {
  try {
    const query = url.parse(req.url).query;
    const authFilter = {
      postWrn: req.params.postWrn,
    };
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

    const countPostReply = await postReplyService.countPostReply(
      authFilter,
      queryFilter
    );
    const postReplies = await postReplyService.listPostReply(
      authFilter,
      queryFilter
    );

    res.send({
      success: true,
      statusCode: 200,
      totalCount: countPostReply,
      result: postReplies,
      message: "listPostReply: 200",
    });
  } catch (err) {
    switch (err.message) {
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "listPostReply: 50000",
        });
        break;
    }
  }
}

export const postReplyRoute: PostReplyRoute = new PostReplyRoute();
