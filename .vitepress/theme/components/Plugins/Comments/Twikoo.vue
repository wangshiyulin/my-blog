<template>
  <div ref="commentRef" :class="['comment-content', 'twikoo', { fill }]" />
</template>

<script setup>
import initComments from "@/utils/initComments";

const props = defineProps({
  // 填充评论区
  fill: {
    type: [Boolean, String],
    default: false,
  },
});

const { theme } = useData();
const { comment } = theme.value;
const route = useRoute();

// 评论数据
const commentRef = ref(null);
let observer = null;
let disposed = false;
let initializing = false;

// 初始化 Twikoo
const initTwikoo = async () => {
  if (initializing || disposed || !comment?.twikoo?.envId) return;
  initializing = true;
  const path = route.path.split("?")[0];
  try {
    await nextTick();
    const target = commentRef.value;
    if (!target || disposed) return;
    const Twikoo = await initComments(theme.value);
    if (disposed || !target.isConnected || target !== commentRef.value) return;
    await Twikoo.init({
      el: target,
      envId: comment.twikoo.envId,
      region: comment.twikoo.region,
      lang: comment.twikoo.lang,
      path,
      onCommentLoaded: () => {
        if (!disposed && props.fill) fillComments(props.fill);
      },
    });
  } catch (error) {
    if (!disposed) console.error("初始化评论出错：", error);
  } finally {
    initializing = false;
  }
};

// 填充评论区
const fillComments = (data) => {
  console.log("填充评论：", data);
  // 只操作当前 Twikoo 实例中的输入框，避免快速评论弹窗和正文评论区互相干扰。
  const commentInput = commentRef.value?.querySelector(".tk-input.el-textarea textarea");
  if (!commentInput) return false;
  // 写入内容
  commentInput.value = data + "\n\n";
  commentInput.dispatchEvent(new Event("input", { bubbles: true }));
  commentInput.focus();
};

onMounted(() => {
  if (typeof window === "undefined") return;

  if (!("IntersectionObserver" in window)) { void initTwikoo(); return; }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer?.disconnect();
      observer = null;
      void initTwikoo();
    },
    { rootMargin: "800px 0px" },
  );

  if (commentRef.value) observer.observe(commentRef.value);
});

onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
  observer = null;
});
</script>
