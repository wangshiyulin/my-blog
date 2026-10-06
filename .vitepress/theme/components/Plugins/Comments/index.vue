<!-- 评论 -->
<template>
  <div
    v-if="theme.comment.enable"
    :key="router.route.path"
    ref="mainCommentRef"
    id="main-comment"
    class="comment"
  >
    <div v-if="!fill" class="title">
      <span class="name">
        <i class="iconfont icon-chat"></i>
        评论
      </span>
      <span class="tool" @click="router.go('/pages/privacy')"> 隐私政策 </span>
    </div>
    <Twikoo :fill="fill" />
  </div>
</template>

<script setup>
import initComments from "@/utils/initComments";
const { theme } = useData();
const router = useRouter();
defineProps({
  // 填充评论区
  fill: {
    type: [Boolean, String],
    default: false,
  },
});
const mainCommentRef = ref(null);

// 获取当前文章评论数。Twikoo 官方 API 支持在未调用 twikoo.init() 前直接查询。
const updateCommentCount = async () => {
  const countElement = document.getElementById("twikoo_comments");
  if (!countElement || !theme.value.comment?.twikoo?.envId) return;

  try {
    const Twikoo = await initComments(theme.value);
    const result = await Twikoo.getCommentsCount({
      envId: theme.value.comment.twikoo.envId,
      region: theme.value.comment.twikoo.region,
      urls: [router.route.path.split("?")[0]],
      includeReply: false,
    });
    const count = result?.[0]?.count;
    if (Number.isFinite(count)) countElement.textContent = String(count);
  } catch (error) {
    console.error("获取评论数失败：", error);
  }
};

// 滚动至评论
const scrollToComments = () => {
  if (!mainCommentRef.value) return false;
  const elementRect = mainCommentRef.value.getBoundingClientRect();
  const elementTop = elementRect.top + window.scrollY;
  window.scrollBy({ top: elementTop - 80, behavior: "smooth" });
};

defineExpose({ scrollToComments });

onMounted(() => {
  if (theme.value.comment.enable && theme.value.comment.type === "twikoo") {
    void updateCommentCount();
  }
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
