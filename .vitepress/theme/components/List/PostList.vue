<!-- 文章列表 -->
<template>
  <div class="post-lists">
    <div
      v-for="(item, index) in listData"
      :key="item.id || item.regularPath"
      :class="['post-item', 's-card', 'hover', { simple }]"
      :style="{ animationDelay: `${0.4 + index / 10}s` }"
      @click="toPost(item.regularPath)"
    >
      <div class="post-content">
        <div v-if="!simple && item?.categories" class="post-category">
          <span v-for="cat in item?.categories" :key="cat" class="cat-name">
            <i class="iconfont icon-folder" />
            {{ cat }}
          </span>
          <!-- 置顶 -->
          <span v-if="item?.top" class="top">
            <i class="iconfont icon-align-top" />
            置顶
          </span>
        </div>
        <span class="post-title">{{ item.title }}</span>
        <span v-if="item?.description" class="post-desc">
          {{ item.description }}
        </span>
        <div v-if="!simple" class="post-meta">
          <div v-if="item?.tags" class="post-tags">
            <span
              v-for="tags in item?.tags"
              :key="tags"
              class="tags-name"
              @click.stop="router.go(taxonomyHref('tags', tags))"
            >
              <i class="iconfont icon-hashtag" />
              {{ tags }}
            </span>
          </div>
          <span class="post-time">{{ formatTimestamp(item?.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
import { mainStore } from "@/store";
import { useClientDate } from "@/utils/useClientDate.mjs";
const { formatTimestamp } = useClientDate();

const store = mainStore();
const router = useRouter();

defineProps({
  // 列表数据
  listData: {
    type: [Array, String],
    default: () => [],
  },
  // 简洁模式
  simple: {
    type: Boolean,
    default: false,
  },
});

// 前往文章
const toPost = (path) => {
  // 记录滚动位置
  if (typeof window !== "undefined") {
    const scrollY = window.scrollY;
    store.lastScrollY = scrollY;
  }
  // 跳转文章
  router.go(path);
};
</script>

<style lang="scss" scoped>
.post-lists {
  .post-item {
    padding: 0!important;
    display: flex;
    margin-bottom: 1rem;
    animation: fade-up 160ms ease-out backwards;
    cursor: pointer;
    overflow: hidden;
    height: 200px;
    
    .post-content {
      flex: 1;
      min-width: 0;
      padding: 1.6rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .post-category {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        color: var(--main-font-second-color);
        font-size: 14px;
        .cat-name {
          display: flex;
          flex-direction: row;
          align-items: center;
          .iconfont {
            opacity: 0.8;
            margin-right: 6px;
            color: var(--main-font-second-color);
          }
        }
        .top {
          margin-left: 12px;
          color: var(--main-color);
          .iconfont {
            opacity: 0.8;
            color: var(--main-color);
          }
        }
      }
      .post-title {
        font-size: 20px;
        line-height: 30px;
        font-weight: bold;
        margin: 0.6rem 0;
        transition: color 0.3s;
        display: -webkit-box;
        overflow: hidden;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .post-desc {
        margin-top: -0.4rem;
        margin-bottom: 0.8rem;
        opacity: 0.8;
        line-height: 30px;
        display: -webkit-box;
        overflow: hidden;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .post-meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        color: var(--main-font-second-color);
        .post-tags {
          display: flex;
          flex: 1;
          min-width: 0;
          flex-wrap: wrap;
          opacity: 0.8;
          margin-right: 20px;
          overflow: hidden;
          mask: linear-gradient(
            90deg,
            #fff 0,
            #fff 90%,
            hsla(0, 0%, 100%, 0.6) 95%,
            hsla(0, 0%, 100%, 0) 100%
          );
          .tags-name {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-right: 12px;
            white-space: nowrap;
            transition: color 0.3s;
            .iconfont {
              font-weight: normal;
              opacity: 0.6;
              margin-right: 4px;
              transition: color 0.3s;
            }
            &:hover {
              color: var(--main-color);
              .iconfont {
                color: var(--main-color);
              }
            }
          }
          @media (max-width: 768px) {
            flex-wrap: nowrap;
          }
        }
        .post-time {
          flex-shrink: 0;
          opacity: 0.6;
          font-size: 13px;
          white-space: nowrap;
        }
      }
    }
    &.simple {
      animation: none;
      padding: 0.5rem 1.4rem;
      background-color: var(--main-card-second-background);
      height: auto;
    }
    &:last-child {
      margin-bottom: 0;
    }
    &:hover {
      .post-content {
        .post-title {
          color: var(--main-color);
        }
      }
    }
    &:active {
      transform: scale(0.98);
    }
    @media (max-width: 768px) {
      height: auto;
      .post-content {
        padding: 1.25rem;
      }
    }
  }
}
</style>
