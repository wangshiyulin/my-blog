<!-- 文章页面 -->
<template>
  <div v-if="postMetaData" :key="postMetaData.regularPath" class="post">
    <div class="post-meta">
      <div class="meta">
        <div class="categories">
          <a
            v-for="(item, index) in postMetaData.categories"
            :key="index"
            :href="taxonomyHref('categories', item)"
            class="cat-item"
          >
            <i class="iconfont icon-folder" />
            <span class="name">{{ item }}</span>
          </a>
        </div>
        <div class="tags">
          <a
            v-for="(item, index) in postMetaData.tags"
            :key="index"
            :href="taxonomyHref('tags', item)"
            class="tag-item"
          >
            <i class="iconfont icon-hashtag" />
            <span class="name">{{ item }}</span>
          </a>
        </div>
      </div>
      <h1 class="title">
        {{ postMetaData.title || "未命名文章" }}
      </h1>
      <div class="other-meta">
        <span class="meta date">
          <i class="iconfont icon-date" />
          {{ formatTimestamp(postMetaData.date) }}
        </span>
        <span class="update meta">
          <i class="iconfont icon-time" />
          {{ formatTimestamp(page?.lastUpdated || postMetaData.lastModified) }}
        </span>
        <!-- 热度 -->
        <span class="hot meta">
          <i class="iconfont icon-fire" />
          <span id="twikoo_visitors" title="阅读量加载中">-</span>
        </span>
        <!-- 评论数 -->
        <span class="chat meta hover" @click="commentRef?.scrollToComments">
          <i class="iconfont icon-chat" />
          <span id="twikoo_comments" title="评论数加载中">-</span>
        </span>
      </div>
    </div>
    <div class="post-content">
      <article class="post-article s-card">
        <!-- 过期提醒 -->
        <div class="expired s-card" v-if="postMetaData?.expired >= 180">
          本文发表于 <strong>{{ postMetaData?.expired }}</strong> 天前，其中的信息可能已经事过境迁
        </div>
        <!-- 文章内容 -->
        <Content id="page-content" class="markdown-main-style" />
        <!-- 文章底部 -->
        <ArticleFooter :post-data="postMetaData" :show-copyright="frontmatter.copyright !== false">
          <!-- 其他信息 -->
          <div class="other-meta">
            <div class="all-tags">
              <a
                v-for="(item, index) in postMetaData.tags"
                :key="index"
                :href="taxonomyHref('tags', item)"
                class="tag-item"
              >
                <i class="iconfont icon-hashtag" />
                <span class="name">{{ item }}</span>
              </a>
            </div>
            <a
              href="mailto:wangshiyu@qingluanx.com"
              class="report"
              target="_blank" rel="noopener noreferrer"
            >
              <i class="iconfont icon-report" />
              反馈与投诉
            </a>
          </div>
        </ArticleFooter>
        <!-- 评论 -->
        <Comments ref="commentRef" />
      </article>
      <Aside showToc />
    </div>
  </div>
</template>

<script setup>
import ArticleFooter from "@/components/ArticleFooter.vue";
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
import { useClientDate } from "@/utils/useClientDate.mjs";
const { formatTimestamp } = useClientDate();
import { generateId } from "@/utils/commonTools";
import { useArticleImages } from "@/utils/useArticleImages.mjs";

const { page, theme, frontmatter } = useData();

// 评论元素
const commentRef = ref(null);

// 获取对应文章数据
const postMetaData = computed(() => {
  const slug = frontmatter.value?.slug;
  if (slug) {
    const postBySlug = theme.value.postData.find((item) => item.slug === slug);
    if (postBySlug) return postBySlug;
  }
  const sourcePath = page.value?.filePath || page.value?.relativePath;
  if (!sourcePath) return null;
  const postId = generateId(sourcePath);
  return theme.value.postData.find((item) => item.id === postId);
});

useArticleImages(theme, page);
</script>

<style lang="scss" scoped>
@use "../style/post.scss";

.post {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: fade-up 160ms ease-out backwards;
  .post-meta {
    padding: 2rem 0 3rem 18px;
    width: 100%;
    .meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      .categories {
        margin-right: 12px;
        .cat-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-mask-Inverse-background);
          opacity: 0.8;
          .iconfont {
            margin-right: 6px;
          }
          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
      .tags {
        display: flex;
        flex-direction: row;
        align-items: center;
        .tag-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          opacity: 0.8;
          .iconfont {
            margin-right: 4px;
            opacity: 0.6;
            font-weight: normal;
          }
          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
    }
    .title {
      font-size: 2.2rem;
      line-height: 1.2;
      color: var(--main-font-color);
      margin: 1.4rem 0;
    }
    .other-meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      .meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 8px;
        opacity: 0.8;
        .iconfont {
          margin-right: 6px;
          transition: color 0.3s;
        }
        &.date {
          padding-left: 0;
        }
        &.hot {
          .iconfont {
            font-size: 18px;
          }
        }
        &.hover {
          transition:
            color 0.3s,
            background-color 0.3s;
          cursor: pointer;
          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
    }
  }
  .post-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    .post-article {
      width: calc(100% - 300px);
      padding: 1rem 2.2rem 2.2rem 2.2rem;
      user-select: text;
      cursor: auto;
      &:hover {
        border-color: var(--main-card-border);
      }
      .expired {
        margin: 1.2rem 0 2rem 0;
        padding: 0.8rem 1.2rem;
        border-left: 6px solid var(--main-warning-color);
        border-radius: 6px 16px 16px 6px;
        user-select: none;
        strong {
          color: var(--main-warning-color);
        }
      }
      .other-meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin: 2rem 0;
        opacity: 0.8;
        .all-tags {
          display: flex;
          flex-direction: row;
          align-items: center;
          .tag-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            background-color: var(--main-card-border);
            margin-right: 12px;
            .iconfont {
              margin-right: 4px;
              opacity: 0.6;
              font-weight: normal;
            }
            &:hover {
              color: var(--main-color);
              background-color: var(--main-color-bg);
              .iconfont {
                color: var(--main-color);
              }
            }
          }
        }
        .report {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-card-border);
          .iconfont {
            margin-right: 6px;
          }
          &:hover {
            color: #efefef;
            background-color: var(--main-error-color);
            .iconfont {
              color: #efefef;
            }
          }
        }
      }
    }
    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }
    @media (max-width: 1200px) {
      .post-article {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
  @media (max-width: 768px) {
    .post-meta {
      padding: 4rem 1.5rem;
      .meta {
        justify-content: center;
        .categories {
          margin-right: 0;
        }
        .tags {
          display: none;
        }
      }
      .title {
        font-size: 1.6rem;
        text-align: center;
        line-height: 40px;
      }
      .other-meta {
        justify-content: center;
      }
    }
    .post-content {
      .post-article {
        border: none;
        padding: 20px 30px;
        .other-meta {
          margin: 1rem 0 2rem 0;
          flex-direction: column;
          .all-tags {
            flex-wrap: wrap;
            .tag-item {
              margin-top: 12px;
            }
          }
          .report {
            margin-top: 20px;
          }
        }
      }
    }
  }
}
</style>
