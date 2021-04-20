import { expect } from "chai";
import { connection } from "../../../rdb/connect";
import { postService } from "./post.service";

before(async () => {
  await connection();
});

describe("postService", () => {
  let post;

  it("createPost", async () => {
    const result: any = await postService.createPost({
      title: "title",
      content: "content",
      publisherId: "publisherId",
      publisherPassword: "publisherPassword",
    });

    // console.log(result);
    post = result;
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      wrn: result.wrn,
      title: "title",
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      publisherPassword: result.publisherPassword,
    });
  });

  it("checkPostPublisherPassword", async () => {
    const result = await postService.checkPostPublisherPassword(
      post.wrn,
      "publisherPassword"
    );
    // console.log(result);
    expect(result).to.be.eqls(true);
  });

  it("countPost", async () => {
    const result = await postService.countPost(
      {},
      {
        filter: {
          status: "ACTIVE",
          or: [
            {
              title: {
                like: "%title%",
              },
            },
            {
              publisherId: {
                like: "%publisherId%",
              },
            },
          ],
        },
      }
    );
    // console.log(result);
    expect(result > 0).to.be.eqls(true);
  });

  it("listPost", async () => {
    const result = await postService.listPost(
      {},
      {
        filter: {
          status: "ACTIVE",
          or: [
            {
              title: {
                like: "%title%",
              },
            },
            {
              publisherId: {
                like: "%title%",
              },
            },
          ],
        },
        orderBy: [
          {
            direction: "DESC",
            field: "createdAt",
          },
        ],
        pagination: {
          first: 10, // limit
          skip: 0, // offset
        },
      }
    );
    // console.log(result);
    expect(result.length > 0).to.be.eqls(true);
  });

  it("getPost", async () => {
    const result: any = await postService.getPost(post.wrn);
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      wrn: result.wrn,
      title: "title",
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      postReplies: [],
    });
  });

  it("updatePost", async () => {
    const result: any = await postService.updatePost(post.wrn, {
      title: "updateTitle",
    });
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      wrn: result.wrn,
      title: "updateTitle",
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      postReplies: [],
    });
  });

  it("deletePost", async () => {
    const result: any = await postService.deletePost(post.wrn);
    // console.log(result);
    delete result.createdAt;
    delete result.updatedAt;
    expect(result).to.be.eqls({
      wrn: result.wrn,
      title: "updateTitle",
      content: "content",
      status: "ACTIVE",
      publisherId: "publisherId",
      postReplies: [],
    });
  });
});
