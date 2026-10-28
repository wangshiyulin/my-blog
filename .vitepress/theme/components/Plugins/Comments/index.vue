<template>
  <div
    v-if="theme.comment.enable"
    :key="router.route.path"
    ref="mainCommentRef"
    id="main-comment"
    class="comment"
  >
    <div class="title">
      <span class="name">
        <i class="iconfont icon-chat"></i>
        评论
      </span>
      <span class="tool" @click="router.go('/pages/privacy')"> 隐私政策 </span>
    </div>
    <div
      ref="commentRef"
      class="comment-content twikoo vp-raw"
      @click.capture="preventCommentActionNavigation"
    />
  </div>
</template>

<script setup>
import { loadScript } from "@/utils/commonTools";
import { observeBloggerAvatars, preventCommentActionNavigation } from "@/utils/commentEnhancements.mjs";

const { theme } = useData();
const router = useRouter();
const mainCommentRef = ref(null);
const commentRef = ref(null);
let observer = null;
let disposed = false;
let generation = 0;
let initializingGeneration = -1;
let countSequence = 0;
let stopAvatarObserver = null;

const setCountState = (current, id, title) => {
  if (disposed || current !== generation) return;
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = "-";
  element.title = title;
};

// 评论展示与计数共用按 URL 去重的资源加载器。
const loadComments = async () => {
  const url = theme.value.comment?.twikoo?.js;
  if (!url) throw new Error("Twikoo script URL is not configured");
  await loadScript(url);
  if (typeof window.twikoo === "object") return window.twikoo;
  throw new Error("Twikoo 初始化失败");
};

const initTwikoo = async (current, target) => {
  const options = theme.value.comment?.twikoo;
  if (disposed || current !== generation || initializingGeneration === current || !options?.envId) return;
  initializingGeneration = current;
  const path = router.route.path.split("?")[0];
  try {
    const Twikoo = await loadComments();
    if (disposed || current !== generation || !target.isConnected || target !== commentRef.value) return;
    await Twikoo.init({
      el: target,
      envId: options.envId,
      region: options.region,
      lang: options.lang,
      path,
      // 提交评论、回复或翻页后，标题旁的评论数也要同步更新。
      onCommentLoaded: () => {
        if (!disposed && current === generation) void updateCommentCount(current);
      },
    });
    if (!disposed && current === generation) {
      const visitors = document.getElementById("twikoo_visitors");
      if (visitors) visitors.title = "阅读量（Twikoo 统计；本地预览不计数）";
    }
  } catch (error) {
    if (!disposed && current === generation) {
      setCountState(current, "twikoo_visitors", "阅读量暂不可用，请检查评论服务连接");
      console.error("初始化评论出错：", error);
    }
  } finally {
    if (initializingGeneration === current) initializingGeneration = -1;
  }
};

const updateCommentCount = async (current) => {
  const sequence = ++countSequence;
  const path = router.route.path.split("?")[0];
  const countElement = document.getElementById("twikoo_comments");
  const options = theme.value.comment?.twikoo;
  if (!countElement || !options?.envId) return;
  try {
    const Twikoo = await loadComments();
    if (disposed || current !== generation) return;
    const result = await Twikoo.getCommentsCount({
      envId: options.envId,
      region: options.region,
      urls: [path],
      includeReply: false,
    });
    const count = result?.find((entry) => entry.url === path)?.count ?? result?.[0]?.count;
    if (!Number.isFinite(count) || count < 0) throw new Error("评论计数返回格式有误");
    if (!disposed && current === generation && sequence === countSequence &&
        countElement.isConnected && router.route.path.split("?")[0] === path && Number.isFinite(count)) {
      countElement.textContent = String(count);
      countElement.title = "评论数（不含回复）";
    }
  } catch (error) {
    if (!disposed && current === generation && sequence === countSequence) {
      setCountState(current, "twikoo_comments", "评论数暂不可用，请检查评论服务连接");
      console.error("获取评论数失败：", error);
    }
  }
};

// 路由复用时也要重新绑定新 DOM；旧请求不能写回新页面。
const updateComments = async () => {
  const current = ++generation;
  countSequence++;
  observer?.disconnect();
  observer = null;
  stopAvatarObserver?.();
  stopAvatarObserver = null;
  await nextTick();
  if (disposed || current !== generation || !theme.value.comment?.enable) return;
  if (theme.value.comment.type !== "twikoo") return;
  setCountState(current, "twikoo_visitors", "阅读量加载中");
  setCountState(current, "twikoo_comments", "评论数加载中");
  void updateCommentCount(current);
  const target = commentRef.value;
  if (!target) return;
  stopAvatarObserver = observeBloggerAvatars(target);
  // 文章阅读量依赖 Twikoo 挂载，进入文章即初始化；普通页面仍按需加载。
  if (document.getElementById("twikoo_visitors") || !("IntersectionObserver" in window)) {
    void initTwikoo(current, target);
    return;
  }
  observer = new IntersectionObserver((entries) => {
    if (disposed || current !== generation || !entries.some((entry) => entry.isIntersecting)) return;
    observer?.disconnect();
    observer = null;
    void initTwikoo(current, target);
  }, { rootMargin: "800px 0px" });
  observer.observe(target);
};

const scrollToComments = () => {
  if (!mainCommentRef.value) return false;
  const elementTop = mainCommentRef.value.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: elementTop - 80,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
};
defineExpose({ scrollToComments });

watch([() => router.route.path, () => theme.value.comment?.enable], updateComments, { flush: "post" });
onMounted(updateComments);
onBeforeUnmount(() => {
  disposed = true;
  stopAvatarObserver?.();
  generation++;
  countSequence++;
  observer?.disconnect();
  observer = null;
});
</script>

<style lang="scss" scoped>
.comment {
  margin-top: 2rem;
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
    .tool {
      opacity: 0.6;
      font-size: 14px;
      cursor: pointer;
      transition:
        opacity 0.3s,
        color 0.3s;
      &:hover {
        opacity: 1;
        color: var(--main-color);
      }
    }
  }
}
</style>
