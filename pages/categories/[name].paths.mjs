import { getAllPosts, getAllCategories } from "../../.vitepress/theme/utils/getPostData.mjs";


const postData = await getAllPosts();
const categoriesData = getAllCategories(postData);

export default {
  paths() {
    return Object.keys(categoriesData).map((name) => ({ params: { name } }));
  },
};
