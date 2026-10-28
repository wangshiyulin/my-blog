import { getAllPosts } from "../../.vitepress/theme/utils/getPostData.mjs";
import { getAllType } from "../../.vitepress/theme/utils/postIndexes.mjs";
import { assertValidTaxonomyName } from "../../.vitepress/theme/utils/taxonomyPaths.mjs";

const postData = await getAllPosts();
const tagsData = getAllType(postData);

export default {
  paths() {
    return Object.keys(tagsData).map((name) => ({ params: { name: assertValidTaxonomyName(name) } }));
  },
};
