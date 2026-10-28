import { getAllPosts } from "../../.vitepress/theme/utils/getPostData.mjs";
import { getAllCategories } from "../../.vitepress/theme/utils/postIndexes.mjs";
import { assertValidTaxonomyName } from "../../.vitepress/theme/utils/taxonomyPaths.mjs";


const postData = await getAllPosts();
const categoriesData = getAllCategories(postData);

export default {
  paths() {
    return Object.keys(categoriesData).map((name) => ({ params: { name: assertValidTaxonomyName(name) } }));
  },
};
