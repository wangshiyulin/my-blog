<template>
  <!-- 背景图片 -->
  <Background />
  <!-- 中控台 -->
  <Control />
  <!-- 导航栏 -->
  <Nav />
  <!-- 主内容 -->
  <main :class="['mian-layout', { 'is-post': isPostPage }]">
    <!-- 404 -->
    <NotFound v-if="page.isNotFound" />
    <!-- 首页 -->
    <Home v-if="frontmatter.layout === 'home'" showHeader />
    <!-- 页面 -->
    <template v-else>
      <!-- 文章页面 -->
      <Post v-if="isPostPage" />
      <!-- 普通页面 -->
      <Page v-else-if="!page.isNotFound" />
    </template>
  </main>
  <!-- 页脚 -->
  <Footer :show-bar="isPostPage && !page.isNotFound" />
  <!-- 全局消息 -->
  <Message />
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { calculateScroll } from "@/utils/helper";

const route = useRoute();
const store = mainStore();

// 首页是首屏核心；文章页、普通页和 404 属于按路由加载的低频视图。
const Post = defineAsyncComponent(() => import("@/views/Post.vue"));
const Page = defineAsyncComponent(() => import("@/views/Page.vue"));
const NotFound = defineAsyncComponent(() => import("@/views/NotFound.vue"));
const { frontmatter, page, theme } = useData();
const { effectiveTheme, hasBackground } = storeToRefs(store);

// 判断是否为文章页面
const isPostPage = computed(() => {
  let routePath = route.path;
  try {
    routePath = decodeURIComponent(routePath);
  } catch {
    /* Keep malformed URLs renderable. */
  }
  routePath = routePath.replace(/\/$/, "");
  return (
    theme.value.postData?.some((post) => post.regularPath.replace(/\/$/, "") === routePath) ?? false
  );
});

// 路由变更后更新滚动信息
const onRouteChanged = () => {
  requestAnimationFrame(() => requestAnimationFrame(() => calculateScroll()));
};

// 复制时触发
const copyTip = () => {
  const copiedText = window.getSelection()?.toString() || "";
  // 检查文本内容是否不为空
  if (copiedText.trim().length > 0 && typeof $message !== "undefined") {
    $message.success("复制成功，在转载时请标注本文地址");
  }
};

// 有背景时强制深色；外层底色与内容面板由 CSS 随主题同步。
const changeSiteThemeType = () => {
  const html = document.documentElement;
  html.classList.toggle("dark", effectiveTheme.value === "dark");
  html.classList.toggle("light", effectiveTheme.value === "light");
  html.classList.toggle("image", hasBackground.value);
  // 浅色主题禁止浏览器自动暗化，保持手机与桌面使用同一套配色。
  html.style.colorScheme = effectiveTheme.value === "light" ? "only light" : "dark";
  html.dataset.theme = effectiveTheme.value;
};
watch([effectiveTheme, hasBackground], changeSiteThemeType);

onMounted(() => {
  // 更改主题类别
  changeSiteThemeType();
  document.documentElement.style.fontSize = theme.value.display.fontSize + "px";
  // 滚动监听
  window.addEventListener("scroll", calculateScroll, { passive: true });
  window.addEventListener("resize", calculateScroll, { passive: true });
  window.addEventListener("vitepress-route-change", onRouteChanged);
  calculateScroll();
  // 复制监听
  window.addEventListener("copy", copyTip);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", calculateScroll);
  window.removeEventListener("resize", calculateScroll);
  calculateScroll.cancel();
  window.removeEventListener("vitepress-route-change", onRouteChanged);
  window.removeEventListener("copy", copyTip);
});
</script>

<style lang="scss" scoped>
.mian-layout {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: block;
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    &.is-post {
      padding: 0;
    }
  }
}
</style>
