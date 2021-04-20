import { expect } from "chai";
import * as qs from "querystring";
import { encode } from "url-encode-decode";
import * as axios from "axios";
import { connection } from "../../../rdb/connect";

const baseUrl = "http://localhost:80";
let post;
let postReply;

before(async () => {
  await connection();

  const body = qs.stringify({
    title: "title",
    content: "content",
    publisherId: "publisherId",
    publisherPassword: "publisherPassword",
  });

  const result = await axios.default.post(`${baseUrl}/post`, body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
  });
  // console.log(result);
  post = result.data.result;
});

describe("postReplyRoute", () => {
  it("createPostReply", async () => {
    const body = qs.stringify({
      postWrn: post.wrn,
      content: "content",
      publisherId: "publisherId",
      publisherPassword: "publisherPassword",
    });

    const result = await axios.default.post(`${baseUrl}/postReply`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    postReply = result.data.result;
    expect(result.data.success).to.be.eqls(true);
  });

  it("listPostReply", async () => {
    const queryString = encode(
      JSON.stringify({
        queryFilter: {
          filter: {
            status: "ACTIVE",
          },
          orderBy: [
            {
              direction: "DESC",
              field: "createdAt",
            },
          ],
          pagination: {
            first: 3,
            skip: 0,
          },
        },
      })
    );
    let result = await axios.default.get(
      `${baseUrl}/postReplies/postWrn/${post.wrn}?${queryString}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      }
    );
    console.log(result.data);
    expect(result.data.success).to.be.eqls(true);
  });
});
