import * as express from "express";

/** Not Found */
export async function notFoundError(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  /**
   *  Error 이라는 정의가 있지만 Error 에는 status 라는 정의가 없어서 any 설정
   */
  const err: any = new Error("Not Found");
  err.status = 404;
  res.send({
    success: false,
    statusCode: 404,
    message: "Not Found",
  });
  next(err);
}

/** 에러 처리 */
export async function serverError(
  err: any,
  req: express.Request,
  res: express.Response
) {
  err.status = err.status || 500;
  console.error(`error on request ${req.method} | ${req.url} | ${err.status}`);
  console.error(err.stack || `${err.message}`);
  err.message = err.stack == 500 ? "SomeThing bad happened." : err.message;
  res.status(err.status).send(err.message);
}
