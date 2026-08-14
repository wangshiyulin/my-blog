import { getAllPosts, getAllType } from "../../.vitepress/theme/utils/getPostData.mjs";

const postData = await getAllPosts();
const tagsData = getAllType(postData);

export default {
  paths() {
    return Object.keys(tagsData).map((name) => ({ params: { name } }));
  },
};
