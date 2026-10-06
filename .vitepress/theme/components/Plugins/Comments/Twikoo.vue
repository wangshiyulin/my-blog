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

// 评论数据
const commentRef = ref(null);
let observer = null;

// 初始化 Twikoo
const initTwikoo = async () => {
  try {
    await nextTick();
    const Twikoo = await initComments(theme.value);
    return Twikoo.init({
      el: commentRef.value,
      envId: comment.twikoo.envId,
      onCommentLoaded: () => {
        if (props.fill) fillComments(props.fill);
      },
    });
  } catch (error) {
    console.error("初始化评论出错：", error);
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
  commentInput.focus();
};

onMounted(() => {
  if (typeof window === "undefined") return;

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer?.disconnect();
      observer = null;
      initTwikoo();
    },
    { rootMargin: "800px 0px" },
  );

  if (commentRef.value) observer.observe(commentRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>
