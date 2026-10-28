<!-- 相关文章 -->
<template>
  <div v-if="relatedData" class="related-post">
    <div class="title">
      <span class="name">
        <i class="iconfont icon-star"></i>
        相关推荐
      </span>
      <span class="shuffle" @click="router.go(shufflePost(theme.postData))"> 随便逛逛 </span>
    </div>
    <!-- 文章列表 -->
    <PostList :listData="relatedData" simple />
  </div>
</template>

<script setup>
import { generateId } from "@/utils/commonTools";
import { shufflePost } from "@/utils/helper";
import { resolvePostIds } from "@/utils/postIndexes.mjs";

const router = useRouter();
const { theme, page, frontmatter } = useData();

// Metadata maps depend on the article collection, not the current route.
const postsById = computed(() => new Map((theme.value.postData || []).map((post) => [post.id, post])));
const postsBySlug = computed(() => new Map((theme.value.postData || []).map((post) => [post.slug, post])));
const relatedData = computed(() => {
  const catName = frontmatter.value.categories?.[0];
  const ids = theme.value.categoriesData?.[catName]?.articles || [];
  const current = postsBySlug.value.get(frontmatter.value.slug);
  const sourcePath = page.value.filePath || page.value.relativePath || "";
  const currentId = current?.id ?? generateId(sourcePath);
  const related = resolvePostIds(postsById.value, ids.filter((id) => id !== currentId).slice(0, 2));
  return related.length ? related : null;
});
</script>

<style lang="scss" scoped>
.related-post {
  margin-top: 1rem;
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 3rem 0 1rem 0;
    padding: 0 6px;
    .name {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: bold;
      .iconfont {
        font-size: 26px;
        font-weight: normal;
        margin-right: 8px;
      }
    }
    .shuffle {
      opacity: 0.6;
      font-size: 14px;
      transition:
        color 0.3s,
        opacity 0.3s;
      cursor: pointer;
      &:hover {
        opacity: 1;
        color: var(--main-color);
      }
    }
  }
}
</style>
