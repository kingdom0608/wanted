import * as bodyParser from "body-parser";
import * as express from "express";
import { postRoute } from "./apis/post/routes/post.route";
import { postReplyRoute } from "./apis/post/routes/postReply.route";
import { notFoundError, serverError } from "./middlewares/error.middleware";

export class Server {
  /** app 에 대한 타입 설정 */
  public app: express.Application;

  constructor() {
    /** express 설정을 위한 express 선언 */
    this.app = express();
    /** 서버 헬스체크 */
    this.app.get("/console", function (req, res) {
      res.send("wanted is Running");
    });
    /** bodyParser 선언 */
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    /** 라우터 추가 */
    this.app.use(postRoute.postRouter);
    this.app.use(postReplyRoute.postReplyRouter);

    /** 라우터 오류 처리 */
    this.app.use(notFoundError);
    this.app.use(serverError);
  }
}
