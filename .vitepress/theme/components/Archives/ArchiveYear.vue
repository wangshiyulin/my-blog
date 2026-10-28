<!-- 当前归档页内的年份分组；全站分页由 Archives 统一管理。 -->
<template>
  <section class="year-list">
    <h2 class="year">{{ year }}</h2>
    <div class="posts">
      <article
        v-for="post in visiblePosts"
        :key="post.id"
        class="posts-item s-card hover"
        role="link"
        tabindex="0"
        @click="router.go(post.regularPath)"
        @keydown.enter="router.go(post.regularPath)"
      >
        <a :href="post.regularPath" class="title" @click.stop>{{ post.title }}</a>
        <div class="tags">
          <a
            v-for="tag in post.tags"
            :key="tag"
            :href="taxonomyHref('tags', tag)"
            class="type-item"
            @click.stop
          >
            <i class="iconfont icon-hashtag" />
            <span class="name">{{ tag }}</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vitepress";
import { resolvePostIds } from "@/utils/postIndexes.mjs";
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";

const router = useRouter();
const props = defineProps({
  year: { type: String, required: true },
  postIds: { type: Array, required: true },
  postById: { type: Map, required: true },
});
const visiblePosts = computed(() => resolvePostIds(props.postById, props.postIds));
</script>

<style lang="scss" scoped>
.year-list {
  margin-bottom: 2rem;
  &:last-child { margin-bottom: 0; }
  .year {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 0 1rem 6px;
    padding-left: 12px;
    font-size: 20px;
    font-weight: bold;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      width: 4px;
      height: 70%;
      background-color: var(--main-color);
      border-radius: 8px;
    }
  }
  .posts-item {
    padding: 20px;
    margin-bottom: 1rem;
    cursor: pointer;
    &:focus-visible { outline: 2px solid var(--main-color); }
    .title {
      display: block;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: bold;
      transition: color 0.3s;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      opacity: 0.6;
      .type-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-right: 8px;
        .iconfont { margin-right: 2px; }
        &:hover { color: var(--main-color); }
      }
    }
    &:last-child { margin-bottom: 0; }
    &:hover .title { color: var(--main-color); }
  }
}
</style>
