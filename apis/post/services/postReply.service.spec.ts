import { expect } from "chai";
import { connection } from "../../../rdb/connect";
import { postService } from "./post.service";
import { postReplyService } from "./postReply.service";

let post;

before(async () => {
  await connection();

  post = await postService.createPost({
    title: "title",
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });
});

after(async () => {
  await postService.deletePost(post.wrn);
});

describe("postReplyService", () => {
  let postReply;

  it("createPostReply", async () => {
    const result: any = await postReplyService.createPostReply({
      postWrn: post.wrn,
      content: "content",
      publisherId: "publisherId",
      publisherPassword: "publisherPassword",
    });

    // console.log(result);
    postReply = result;
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postWrn: result.postWrn,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      publisherPassword: result.publisherPassword,
    });
  });

  it("countPostReply", async () => {
    const result = await postReplyService.countPostReply(
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

  it("listPostReply", async () => {
    const result = await postReplyService.listPostReply(
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

  it("getPostReply", async () => {
    const result: any = await postReplyService.getPostReply(postReply.index);
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postWrn: result.postWrn,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      postSubReplies: [],
    });
  });

  it("deletePostReply", async () => {
    const result: any = await postReplyService.deletePostReply(postReply.index);
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      index: result.index,
      postWrn: result.postWrn,
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      postSubReplies: [],
    });
  });
});
