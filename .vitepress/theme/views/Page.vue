<!-- 普通页面 -->
<template>
  <div :class="[frontmatter.layout || 'page', { 'has-aside': frontmatter.aside }]">
    <div class="page-content">
      <!-- 页面内容 -->
      <Content id="page-content" :class="['markdown-main-style', { 's-card': frontmatter.card }]" />
      <!-- 评论 -->
      <Comments v-if="frontmatter.comment" />
    </div>
    <Aside v-if="frontmatter.aside" />
  </div>
</template>

<script setup>
import { useArticleImages } from "@/utils/useArticleImages.mjs";
const { frontmatter, theme, page } = useData();
useArticleImages(theme, page);
</script>

<style lang="scss" scoped>
@use "../style/post.scss";

.page {
  width: 100%;
  display: flex;
  flex-direction: row;
  animation: fade-up 160ms ease-out backwards;
  .page-content {
    width: 100%;
    transition: width 0.3s;
    :deep(#main-comment) {
      width: 100%;
    }
    .s-card {
      padding: 1rem 2rem;
    }
  }
  &.has-aside {
    .page-content {
      width: calc(100% - 300px);
    }
    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }
  }
  @media (max-width: 1200px) {
    .page-content {
      width: 100% !important;
    }
    .main-aside {
      display: none;
    }
  }
}
</style>
