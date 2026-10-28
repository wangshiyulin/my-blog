<template>
  <div v-if="showCopyright" class="copyright s-card">
    <div class="title">
      <span class="post-name">{{ postData?.title || "未命名文章" }}</span>
      <a :href="theme.siteMeta.site + route.path" class="post-link" target="_blank" rel="noopener noreferrer">
        {{ theme.siteMeta.site + route.path }}
      </a>
    </div>
    <div class="post-meta">
      <div class="meta-item">
        <span class="tip">作者</span>
        <span class="name">{{ theme.siteMeta.author.name }}</span>
      </div>
      <div class="meta-item">
        <span class="tip">发布于</span>
        <span class="name">{{ formatTimestamp(postData?.date) }}</span>
      </div>
      <div class="meta-item">
        <span class="tip">更新于</span>
        <span class="name">{{ formatTimestamp(postData?.lastModified) }}</span>
      </div>
      <div class="meta-item cc">
        <span class="tip">许可协议</span>
        <a
          class="name"
          href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans"
          target="_blank" rel="noopener noreferrer"
        >
          CC BY-NC-ND 4.0
        </a>
      </div>
    </div>
    <span class="meta-tip">署名-非商业性使用-禁止演绎 4.0 国际</span>
  </div>
  <slot />
  <div
    v-if="nextPostData"
    :class="[
      'next-post',
      's-card',
      {
        fixed: true,
        show: nextPostShow && !footerIsShow,
      },
    ]"
    @click="router.go(nextPostData?.regularPath)"
  >
    <span class="post-tip">
      {{ isNextPost ? "下一篇阅读" : "阅读上一篇" }}
    </span>
    <span class="post-title">
      {{ nextPostData?.title || "暂无标题" }}
    </span>
  </div>
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
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { shufflePost } from "@/utils/helper";
import { useClientDate } from "@/utils/useClientDate.mjs";
const { formatTimestamp } = useClientDate();
import { generateId } from "@/utils/commonTools";
import { resolvePostIds } from "@/utils/postIndexes.mjs";

const { theme, page, frontmatter } = useData();
const route = useRoute();
const router = useRouter();
const store = mainStore();
const { footerIsShow } = storeToRefs(store);

defineProps({
  postData: { type: Object, default: () => ({}) },
  showCopyright: { type: Boolean, default: true },
});

// 前后篇导航与可见性监听
// 文章信息
let observer = null;
let observedPost = null;
let disposed = false;
const isNextPost = ref(true);
const nextPostShow = ref(false);
const nextPostData = ref(null);

// 获取文章
const getNextPostData = () => {
  const { postData } = theme.value;
  const { filePath, frontmatter } = page.value;
  if (!postData) return false;
  // 本篇索引：优先使用 slug，避免 URL 重写后依赖源文件路径。
  const currentSlug = frontmatter?.slug;
  const postIndex = currentSlug
    ? postData.findIndex((post) => post.slug === currentSlug)
    : filePath
      ? postData.findIndex((post) => post.id === generateId(filePath))
      : -1;
  // 是否有下一篇
  if (postIndex >= 0 && postIndex < postData.length - 1) {
    nextPostData.value = postData[postIndex + 1];
    isNextPost.value = true;
    return true;
  }
  // 是否有上一篇
  else if (postIndex > 0) {
    nextPostData.value = postData[postIndex - 1];
    isNextPost.value = false;
    return true;
  }
  // 如果没有任何文章
  nextPostData.value = null;
  return false;
};

// Reuse the observer when VitePress reuses the same article container.
const isShowNext = () => {
  const postDom = document.getElementById("page-content");
  if (!postDom) {
    observer?.disconnect();
    observedPost = null;
    nextPostShow.value = false;
    return;
  }
  const bounds = postDom.getBoundingClientRect();
  nextPostShow.value = bounds.bottom <= 0 || bounds.top >= window.innerHeight;
  if (postDom === observedPost) return;
  observer?.disconnect();
  if (!("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver((entries) => {
    nextPostShow.value = !entries[0]?.isIntersecting;
  });
  observedPost = postDom;
  observer.observe(postDom);
};
const updatePost = async () => {
  await nextTick();
  if (disposed) return;
  getNextPostData();
  isShowNext();
};
watch(() => page.value.relativePath, updatePost, { flush: "post" });
onMounted(updatePost);
onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
  observedPost = null;
});

// 相关文章
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
.copyright {
  position: relative;
  background-color: var(--main-card-second-background);
  padding: 18px;
  margin-top: 2rem;
  overflow: hidden;
  .title {
    display: flex;
    flex-direction: column;
    .post-link {
      margin-top: 2px;
      font-size: 14px;
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
    }
  }
  .post-meta {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1rem 0;
    .meta-item {
      display: flex;
      flex-direction: column;
      margin-right: 2rem;
      .name {
        margin-top: 4px;
        font-size: 14px;
        opacity: 0.6;
        transition:
          color 0.3s,
          opacity 0.3s;
        cursor: pointer;
      }
      &.cc {
        .name {
          &:hover {
            opacity: 1;
            color: var(--main-color);
          }
        }
      }
    }
  }
  .meta-tip {
    opacity: 0.4;
  }
  &::after {
    content: "\e021";
    position: absolute;
    top: -4rem;
    right: -4rem;
    font-family: "iconfont";
    opacity: 0.1;
    font-size: 16rem;
    transform: rotate(334deg);
  }
  @media (max-width: 768px) {
    .post-meta {
      display: none;
    }
    .meta-tip {
      display: inline-block;
      margin-top: 12px;
      font-size: 14px;
    }
  }
}

.next-post {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--main-card-background);
  .post-tip {
    font-size: 14px;
    color: var(--main-font-second-color);
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px dashed var(--main-card-border);
    transition: color 0.3s;
  }
  .post-title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  &.fixed {
    position: fixed;
    right: 20px;
    bottom: 20px;
    opacity: 0;
    pointer-events: none;
    z-index: 100;
    width: 300px;
    transform: translateY(180px);
  }
  &.show {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0);
  }
  &:hover {
    background-color: var(--main-color);
    border-color: var(--main-color);
    color: var(--main-on-accent-color);
    box-shadow: 0 8px 16px -4px var(--main-color-bg);
    .post-tip {
      opacity: 0.8;
      color: var(--main-on-accent-color);
    }
  }
  @media (max-width: 768px) {
    display: none;
  }
}

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
