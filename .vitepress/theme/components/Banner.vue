<template>
  <div v-if="type === 'text'" class="banner" id="main-banner">
    <h1 class="title">你好，欢迎来到{{ theme.siteMeta.title }}</h1>
    <div class="subtitle">
      <Transition name="fade" mode="out-in">
        <span :key="hitokotoData?.hitokoto" class="text">
          {{ hitokotoData?.hitokoto ? hitokotoData?.hitokoto : theme.siteMeta.description }}
        </span>
      </Transition>
    </div>
  </div>
  <div v-else-if="type === 'page'" class="banner-page s-card">
    <div class="top">
      <div class="title">
        <span class="title-small">{{ title }}</span>
        <span class="title-big">{{ desc }}</span>
      </div>
      <div class="top-right">
        <slot name="header-slot" />
      </div>
    </div>
    <slot />

  </div>
</template>

<script setup>
/**
 * 获取首页一言。
 */
const getHitokoto = async (signal) => {
  const response = await fetch("https://v1.hitokoto.cn", { signal });
  if (!response.ok) throw new Error(`一言请求失败: ${response.status}`);
  return response.json();
};

const { theme } = useData();
const props = defineProps({
  // 类型
  type: {
    type: String,
    default: "text",
  },
  // 标题
  title: {
    type: String,
    default: "这里是标题",
  },
  // 简介
  desc: {
    type: String,
    default: "这里是简介",
  },

});

const hitokotoData = ref(null);
const hitokotoTimeOut = ref(null);
let disposed = false;
let hitokotoController = null;

// 获取一言数据
const getHitokotoData = async () => {
  hitokotoController?.abort();
  const controller = new window.AbortController();
  hitokotoController = controller;
  try {
    const result = await getHitokoto(controller.signal);
    if (disposed || controller.signal.aborted) return;
    const { hitokoto, from, from_who } = result;
    hitokotoData.value = { hitokoto, from, from_who };
  } catch (error) {
    if (disposed || controller.signal.aborted) return;
    if (typeof $message !== "undefined") $message.error("一言获取失败");
    console.error("一言获取失败：", error);
  } finally {
    if (hitokotoController === controller) hitokotoController = null;
  }
};

onMounted(() => {
  if (props.type === "text") {
    hitokotoTimeOut.value = setTimeout(() => {
      getHitokotoData();
    }, 2000);
  }
});

onBeforeUnmount(() => {
  disposed = true;
  hitokotoController?.abort();
  clearTimeout(hitokotoTimeOut.value);
});
</script>

<style lang="scss" scoped>
.banner {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fade-up 160ms ease-out backwards;
  .title {
    font-family: "Site Title";
    font-weight: bold;
    font-size: 2.75rem;
  }
  .subtitle {
    width: 80%;
    font-size: 1.25rem;
    opacity: 0.8;
    animation: fade-up-opacity 160ms ease-out backwards;
    .text {
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  @media (max-width: 768px) {
    align-items: flex-start;
    height: 240px;
    .title {
      font-size: 2.25rem;
    }
    .subtitle {
      height: 50px;
      font-size: 1.125rem;
      margin-left: 8px;
      .text {
        text-align: left;
      }
    }
  }
}
.banner-page {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  min-height: 380px;
  .top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    .title {
      display: flex;
      flex-direction: column;
      .title-small {
        color: var(--main-font-second-color);
        font-size: 0.875rem;
      }
      .title-big {
        font-size: 2.25rem;
        font-weight: bold;
        line-height: 1.2;
        margin-top: 12px;
      }
    }
  }
  @media (max-width: 1200px) {
    min-height: 300px;
  }
  @media (max-width: 768px) {
    min-height: 260px;
    .top-right {
      display: none;
    }
  }
}
</style>
