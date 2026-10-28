<!-- 分类导航条 -->
<template>
  <div v-if="type === 'categories'" class="type-bar s-card hover">
    <div class="all-type">
      <a
        v-if="currentTypeName"
        :href="taxonomyHref('categories', currentTypeName)"
        class="type-item choose"
      >
        {{ currentTypeName }}
      </a>
      <a href="/" :class="['type-item', { choose: !currentTypeName }]">首页</a>
      <a
        v-for="(_, key, index) in theme.categoriesData"
        :key="index"
        :href="taxonomyHref('categories', key)"
        :class="['type-item', { hidden: currentTypeName === key }]"
      >
        {{ key }}
      </a>
    </div>
    <a href="/pages/categories" class="more-type">
      <i class="iconfont icon-arrow-right" />
      更多
    </a>
  </div>
  <div v-else-if="type === 'tags'" class="type-bar s-card hover">
    <div class="all-type">
      <a
        v-if="currentTypeName"
        :href="taxonomyHref('tags', currentTypeName)"
        class="type-item choose"
      >
        {{ currentTypeName }}
        <span class="num">{{ theme.tagsData?.[currentTypeName]?.count || 0 }}</span>
      </a>
      <a
        v-for="(item, key, index) in theme.tagsData"
        :key="index"
        :href="taxonomyHref('tags', key)"
        :class="['type-item', { hidden: currentTypeName === key }]"
      >
        {{ key }}
        <span class="num">{{ item.count }}</span>
      </a>
    </div>
    <a href="/pages/tags" class="more-type">
      <i class="iconfont icon-arrow-right" />
      更多
    </a>
  </div>
</template>

<script setup>
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
const { theme, params } = useData();
defineProps({
  // 显示类别
  type: {
    type: String,
    default: "categories",
  },
});

// 获取当前路由路径
const currentTypeName = computed(() => {
  return params.value?.name || null;
});
</script>

<style lang="scss" scoped>
.type-bar {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-weight: bold;
  animation: fade-up 160ms ease-out backwards;
  .all-type {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 12px;
    overflow: hidden;
    mask: linear-gradient(
      90deg,
      #fff 0,
      #fff 90%,
      hsla(0, 0%, 100%, 0.6) 95%,
      hsla(0, 0%, 100%, 0) 100%
    );
    .type-item {
      display: flex;
      align-items: center;
      padding: 0.1rem 0.5rem;
      margin-right: 6px;
      font-weight: bold;
      border-radius: 8px;
      white-space: nowrap;
      height: 30px;
      cursor: pointer;
      .num {
        margin-left: 4px;
        font-weight: normal;
        padding: 2px 6px;
        font-size: 0.75rem;
        color: var(--main-font-color);
        background-color: var(--main-card-border);
        border-radius: 8px;
      }
      &.choose {
        color: var(--main-on-accent-color);
        background-color: var(--main-color);
        .num {
          color: var(--main-on-accent-color);
        }
      }
      &.hidden {
        display: none;
      }
      &:hover {
        color: var(--main-on-accent-color);
        background-color: var(--main-color);
        .num {
          color: var(--main-on-accent-color);
        }
      }
    }
  }
  .more-type {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    margin-right: 4px;
    margin-left: 8px;
    .iconfont {
      font-size: 0.9375rem;
      margin-right: 8px;
    }
    &:hover {
      .iconfont {
        color: var(--main-color);
      }
    }
  }
  @media (max-width: 768px) {
    .all-type {
      flex: 1;
      min-width: 0;
      width: auto;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      .type-item {
        flex-shrink: 0;
      }
    }
    .more-type {
      flex-shrink: 0;
    }
  }
}
</style>
