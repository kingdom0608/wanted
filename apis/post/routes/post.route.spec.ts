import { expect } from "chai";
import * as qs from "querystring";
import { encode } from "url-encode-decode";
import * as axios from "axios";
import { connection } from "../../../rdb/connect";

const baseUrl = "http://localhost:80";
let post;

before(async () => {
  await connection();
});

describe("postRoute", () => {
  it("createPost", async () => {
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
    expect(result.data.success).to.be.eqls(true);
  });

  it("listPost", async () => {
    const queryString = encode(
      JSON.stringify({
        queryFilter: {
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
            first: 3,
            skip: 0,
          },
        },
      })
    );
    let result = await axios.default.get(`${baseUrl}/posts?${queryString}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    expect(result.data.success).to.be.eqls(true);
  });

  it("updatePost - 작성자 비밀번호 불일치", async () => {
    const body = qs.stringify({
      wrn: post.wrn,
      title: "updateTitle",
      publisherPassword: "wrongPublisherPassword",
    });

    const result = await axios.default.put(`${baseUrl}/post`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    expect(result.data.success).to.be.eqls(false);
  });

  it("updatePost", async () => {
    const body = qs.stringify({
      wrn: post.wrn,
      title: "updateTitle",
      publisherPassword: "publisherPassword",
    });

    const result = await axios.default.put(`${baseUrl}/post`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    expect(result.data.success).to.be.eqls(true);
  });

  it("deletePost - 작성자 비밀번호 불일치", async () => {
    const body = qs.stringify({
      wrn: post.wrn,
      publisherPassword: "wrongPublisherPassword",
    });

    const result = await axios.default.delete(`${baseUrl}/post`, {
      data: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    expect(result.data.success).to.be.eqls(false);
  });

  it("deletePost", async () => {
    const body = qs.stringify({
      wrn: post.wrn,
      publisherPassword: "publisherPassword",
    });

    const result = await axios.default.delete(`${baseUrl}/post`, {
      data: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    // console.log(result);
    expect(result.data.success).to.be.eqls(true);
  });
});
