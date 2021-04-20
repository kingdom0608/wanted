import { expect } from "chai";
import { connection } from "../../../rdb/connect";
import { postService } from "./post.service";
import { postReplyService } from "./postReply.service";
import { postSubReplyService } from "./postSubReply.service";

let post;
let postReply;

before(async () => {
  await connection();

  /** 게시글 생성 */
  post = await postService.createPost({
    title: "title",
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });

  /** 게시글 댓글 생성 */
  postReply = await postReplyService.createPostReply({
    postWrn: post.wrn,
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });
});

after(async () => {
  await postService.deletePost(post.wrn);
});

describe("postSubReplyService", () => {
  let postSubReply;

  it("createPostSubReply", async () => {
    const result: any = await postSubReplyService.createPostSubReply({
      postReplyIndex: postReply.index,
      content: "content",
      publisherId: "publisherId",
      publisherPassword: "publisherPassword",
    });

    // console.log(result);
    postSubReply = result;
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postReplyIndex: postReply.index,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      publisherPassword: result.publisherPassword,
    });
  });

  it("countPostSubReply", async () => {
    const result = await postSubReplyService.countPostSubReply(
      {},
      {
        filter: {
          status: "ACTIVE",
        },
      }
    );
    // console.log(result);
    expect(result > 0).to.be.eqls(true);
  });

  it("listPostSubReply", async () => {
    const result = await postSubReplyService.listPostSubReply(
      {},
      {
        filter: {
          status: "ACTIVE",
        },
        orderBy: [
          {
            direction: "DESC",
            field: "createdAt",
          },
        ],
      }
    );
    // console.log(result);
    expect(result.length > 0).to.be.eqls(true);
  });

  it("getPostSubReply", async () => {
    const result: any = await postSubReplyService.getPostSubReply(
      postSubReply.index
    );
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postReplyIndex: postReply.index,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
    });
  });

  it("deletePostSubReply", async () => {
    const result: any = await postSubReplyService.deletePostSubReply(
      postSubReply.index
    );
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postReplyIndex: postReply.index,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
    });
  });
});
