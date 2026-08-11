<!-- 首页 -->
<template>
  <div class="home">
    <Banner v-if="showHeader" :height="store.bannerType" />
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
              ? `/pages/categories/${showCategories}`
              : showTags
                ? `/pages/tags/${showTags}`
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
const { theme } = useData();
const store = mainStore();
const route = useRoute();

const props = defineProps({
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: false,
  },
  // 当前页码
  page: {
    type: Number,
    default: 1,
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
  const params =
    new URLSearchParams(
      window.location.search
    );
  const page =
    Number(params.get("page") || 1);
  currentQueryPage.value =
    page > 0 ? page : 1;
};

// 当前页码
const currentPage = computed(() => {
  // 分类 / 标签
  if (
    props.showCategories ||
    props.showTags
  ) {
    return currentQueryPage.value;
  }

  // 首页
  const match =
    route.path?.match(
      /\/page\/(\d+)/
    );
  if (match) {
    return Number(match[1]);
  }
  return 1;
});

// 总文章数量
const allListTotal = computed(() => {
  const data =
    props.showCategories
      ? theme.value.categoriesData[
          props.showCategories
        ]?.articles
      : props.showTags
        ? theme.value.tagsData[
            props.showTags
          ]?.articles
        : theme.value.postData;
  return data
    ? data.length
    : 0;
});

// 根据页码获取文章
const postData = computed(() => {
  const page =
    currentPage.value - 1;
  let data = null;

  // 分类
  if (props.showCategories) {
    data =
      theme.value.categoriesData[
        props.showCategories
      ]?.articles;
  }
  // 标签
  else if (props.showTags) {
    data =
      theme.value.tagsData[
        props.showTags
      ]?.articles;
  }
  // 首页
  else {
    data =
      theme.value.postData;
  }
  return data
    ? data.slice(
        page * postSize,
        page * postSize + postSize
      )
    : [];
});

// 恢复滚动位置
const restoreScrollY = (val) => {
  if (
    typeof window === "undefined" ||
    val
  ) {
    return false;
  }
  const scrollY =
    store.lastScrollY;
  nextTick().then(() => {
    window.scrollTo({
      top: scrollY,
      behavior: "smooth",
    });
    store.lastScrollY = 0;
  });
};

// 页面加载
onMounted(() => {
  // 初始化分类/标签页码
  if (
    props.showCategories ||
    props.showTags
  ) {
    updateQueryPage();
  }

  // 监听VitePress路由变化
  window.addEventListener(
    "vitepress-route-change",
    () => {
      if (
        props.showCategories ||
        props.showTags
      ) {
        updateQueryPage();
      }
    }
  );
});
onBeforeUnmount(() => {
  window.removeEventListener(
    "vitepress-route-change",
    updateQueryPage
  );
});

// 监听加载结束
watch(
  () => store.loadingStatus,
  (val) => restoreScrollY(val),
);
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
