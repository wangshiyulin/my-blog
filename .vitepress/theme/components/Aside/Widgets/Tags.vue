<!-- 侧边栏 - 标签 -->
<template>
  <div class="tags-cloud s-card">
    <div class="title">
      <i class="iconfont icon-hashtag"></i>
      <span class="title-name">热门标签</span>
    </div>
    <div class="all-tags">
      <a
        v-for="tag in popularTags"
        :key="tag.name"
        :href="taxonomyHref('tags', tag.name)"
        class="tags"
      >
        <span class="name">{{ tag.name }}</span>
        <sup class="num">{{ tag.count }}</sup>
      </a>
    </div>
    <a href="/pages/tags" class="more-tags">查看全部</a>
  </div>
</template>

<script setup>
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
const { theme } = useData();
// 侧栏只展示文章数大于 2 的标签，最多 40 项；完整标签仍可从「查看全部」进入。
const popularTags = computed(() =>
  Object.entries(theme.value.tagsData || {})
    .filter(([, entry]) => entry.count > 2)
    .sort(([nameA, a], [nameB, b]) => b.count - a.count || nameA.localeCompare(nameB, "zh-CN"))
    .slice(0, 40)
    .map(([name, entry]) => ({ name, count: entry.count })),
);
</script>

<style lang="scss" scoped>
.tags-cloud {
  .all-tags {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .tags {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px;
      border-radius: 8px;
      .num {
        margin-left: 2px;
        opacity: 0.6;
      }
      &:hover {
        color: var(--main-color);
        background-color: var(--main-color-bg);
      }
    }

  }
  .more-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    border: 1px solid var(--main-card-border);
    background-color: var(--main-card-second-background);
    &:hover {
      color: var(--main-color);
      border-color: var(--main-color-bg);
      background-color: var(--main-color-bg);
    }
  }
}
</style>
