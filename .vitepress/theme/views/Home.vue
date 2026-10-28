<!-- 首页 -->
<template>
  <div class="home">
    <Banner v-if="showHeader" />
    <div class="home-content">
      <div class="posts-content">
        <!-- 分类总览 -->
        <TypeBar :type="showTags ? 'tags' : 'categories'" />
        <!-- 文章列表 -->
        <PostList :listData="postData" />
        <!-- 分页 -->
        <Pagination
          :total="allListTotal"
          :page="currentPage"
          :limit="postSize"
          :useParams="showCategories || showTags ? true : false"
          :routePath="
            showCategories
              ? taxonomyHref('categories', showCategories)
              : showTags
                ? taxonomyHref('tags', showTags)
                : ''
          "
        />
      </div>
      <!-- 侧边栏 -->
      <Aside />
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { resolvePostIds } from "@/utils/postIndexes.mjs";
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";
const { theme } = useData();
const store = mainStore();
const route = useRoute();

const props = defineProps({
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: false,
  },
  // 分类
  showCategories: {
    type: [null, String],
    default: null,
  },
  // 标签
  showTags: {
    type: [null, String],
    default: null,
  },
});

// 每页数量
const postSize = theme.value.postSize;

// 分类、标签使用的URL页码
const currentQueryPage = ref(1);

// 更新URL参数页码
const updateQueryPage = () => {
  if (typeof window === "undefined") {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page") || 1);
  currentQueryPage.value = Number.isSafeInteger(page) && page > 0 ? page : 1;
};

// 当前页码
const currentPage = computed(() => {
  // 分类 / 标签
  if (props.showCategories || props.showTags) {
    return Math.min(currentQueryPage.value, Math.max(1, Math.ceil(allListTotal.value / postSize)));
  }

  // 首页
  const match = route.path?.match(/\/page\/(\d+)/);
  if (match) {
    return Number(match[1]);
  }
  return 1;
});

// 总文章数量
const allListTotal = computed(() => {
  const data = props.showCategories
    ? theme.value.categoriesData[props.showCategories]?.articles
    : props.showTags
      ? theme.value.tagsData[props.showTags]?.articles
      : theme.value.postData;
  return data ? data.length : 0;
});

// 缓存文章 ID -> 元数据映射，标签和分类索引无需重复保存完整文章。
const postsById = computed(() => new Map(theme.value.postData.map((post) => [post.id, post])));

// 只把当前页的 ID 映射为文章对象，文章增长时不解析全部分类内容。
const postData = computed(() => {
  const offset = (currentPage.value - 1) * postSize;
  if (props.showCategories || props.showTags) {
    const groups = props.showCategories ? theme.value.categoriesData : theme.value.tagsData;
    const key = props.showCategories || props.showTags;
    const ids = groups[key]?.articles || [];
    return resolvePostIds(postsById.value, ids.slice(offset, offset + postSize));
  }
  return theme.value.postData.slice(offset, offset + postSize);
});

// 从文章返回首页时恢复离开前的滚动位置；不依赖已删除的加载页。
const restoreScrollY = async () => {
  if (typeof window === "undefined" || !store.lastScrollY) return;
  const scrollY = store.lastScrollY;
  store.lastScrollY = 0;
  await nextTick();
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: "instant" });
  });
};

// 监听 VitePress 路由变化
const onRouteChanged = () => {
  if (props.showCategories || props.showTags) {
    updateQueryPage();
  } else {
    void restoreScrollY();
  }
};

// 页面加载
onMounted(() => {
  // 初始化分类/标签页码
  if (props.showCategories || props.showTags) {
    updateQueryPage();
  }

  window.addEventListener("vitepress-route-change", onRouteChanged);
  if (!props.showCategories && !props.showTags) void restoreScrollY();
});

onBeforeUnmount(() => {
  window.removeEventListener("vitepress-route-change", onRouteChanged);
});
</script>

<style lang="scss" scoped>
.home {
  .home-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    .posts-content {
      width: calc(100% - 300px);
      transition: width 0.3s;
    }
    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }
    @media (max-width: 1200px) {
      .posts-content {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
}
</style>
