import * as express from "express";
import { postSubReplyService } from "../services";

export class PostSubReplyRoute {
  public postSubReplyRouter: express.Router = express.Router();

  constructor() {
    this.router();
  }

  public router() {
    this.postSubReplyRouter.post("/postSubReply", createPostSubReply);
  }
}

interface ICreatePostSubReply {
  postReplyIndex: number;
  content: string;
  publisherId: string;
  publisherPassword: string;
}

/**
 * route: 게시글 대댓글 생성
 * @param req
 * @param res
 */
async function createPostSubReply(req, res) {
  try {
    const body: ICreatePostSubReply = req.body;
    const result = await postSubReplyService.createPostSubReply({
      postReplyIndex: body.postReplyIndex,
      content: body.content,
      publisherId: body.publisherId,
      publisherPassword: body.publisherPassword,
    });

    res.send({
      success: true,
      statusCode: 200,
      result: result,
      message: "createPostSubReply: 200",
    });
  } catch (err) {
    switch (err.message) {
      default:
        res.send({
          success: false,
          statusCode: 500,
          message: "createPostSubReply: 50000",
        });
        break;
    }
  }
}

export const postSubReplyRoute: PostSubReplyRoute = new PostSubReplyRoute();
