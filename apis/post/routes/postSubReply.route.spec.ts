import { expect } from "chai";
import * as qs from "querystring";
import * as axios from "axios";
import { connection } from "../../../rdb/connect";

const baseUrl = "http://localhost:80";
let post;
let postReply;

before(async () => {
  await connection();

  /** 게시글 생성 */
  const postBody = qs.stringify({
    title: "title",
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });

  const postResponse = await axios.default.post(`${baseUrl}/post`, postBody, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
  });
  // console.log(result);
  post = postResponse.data.result;

  /** 게시글 댓글 생성 */
  const postReplyBody = qs.stringify({
    postWrn: post.wrn,
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });

  const postReplyResponse = await axios.default.post(
    `${baseUrl}/postReply`,
    postReplyBody,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    }
  );
  // console.log(result);
  postReply = postReplyResponse.data.result;
});

after(async () => {
  /** 게시글 삭제 */
  const body = qs.stringify({
    wrn: post.wrn,
    publisherPassword: "publisherPassword",
  });

  await axios.default.delete(`${baseUrl}/post`, {
    data: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
  });
});

describe("postSubReplyRoute", () => {
  it("createPostSubReply", async () => {
    const body = qs.stringify({
      postReplyIndex: postReply.index,
      content: "content",
      publisherId: "publisherId",
      publisherPassword: "publisherPassword",
    });

    const result = await axios.default.post(`${baseUrl}/postSubReply`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    postReply = result.data.result;
    expect(result.data.success).to.be.eqls(true);
  });
});
