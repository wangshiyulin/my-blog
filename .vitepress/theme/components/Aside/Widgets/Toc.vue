<template>
  <!-- 目录 -->
  <div v-if="tocData && tocData?.length" class="toc s-card">
    <div class="toc-title">
      <i class="iconfont icon-toc" />
      <span class="name">目录</span>
    </div>
    <div id="toc-all" class="toc-list" :style="{ '--height': activeTocHeight + 'px' }">
      <span
        v-for="(item, index) in tocData"
        :key="index"
        :id="'toc-' + item.id"
        :class="[
          'toc-item',
          item.type,
          { active: item.id === activeHeader || (index === 0 && !activeHeader) },
        ]"
        @click="scrollToHeader(item.id)"
      >
        {{ item.text }}
      </span>
    </div>
  </div>
</template>

<script setup>

const route = useRoute();

const tocData = ref(null);
const postDom = ref(null);
const activeHeader = ref(null);
const activeTocHeight = ref(0);

// 缓存标题 DOM / 位置，滚动时仅二分查找；图片改变布局时重新测量。
let titlePositions = [];
let contentObserver;
let scrollFrame = 0;
let measureFrame = 0;
let disposed = false;

const getAllTitle = () => {
  const content = document.getElementById("page-content");
  postDom.value = content;
  if (!content) return [];
  return Array.from(content.querySelectorAll("h2, h3")).filter(
    (header) => header.parentElement?.tagName.toLowerCase() === "div",
  );
};

const updateActiveHeader = () => {
  scrollFrame = 0;
  if (!titlePositions.length) return;
  const position = window.scrollY + 120;
  let low = 0;
  let high = titlePositions.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (titlePositions[mid].top <= position) low = mid + 1;
    else high = mid;
  }
  const nextId = titlePositions[Math.max(0, low - 1)].id;
  if (activeHeader.value !== nextId) activeHeader.value = nextId;
};

const activeTocItem = () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveHeader);
};

const measureTitles = () => {
  measureFrame = 0;
  const headers = getAllTitle();
  const scrollY = window.scrollY;
  titlePositions = headers.map((header) => ({
    id: header.id,
    top: header.getBoundingClientRect().top + scrollY,
  }));
  activeTocItem();
};

const scheduleMeasure = () => {
  if (!measureFrame) measureFrame = requestAnimationFrame(measureTitles);
};

const generateDirData = () => {
  if (disposed) return;
  activeHeader.value = null;
  const headers = getAllTitle();
  tocData.value = headers.map((header) => ({
    id: header.id,
    type: header.tagName,
    text: header.textContent?.replace(/\u200B/g, "").trim(),
  }));
  contentObserver?.disconnect();
  if (typeof ResizeObserver !== "undefined" && postDom.value) {
    contentObserver ??= new ResizeObserver(scheduleMeasure);
    contentObserver.observe(postDom.value);
  }
  scheduleMeasure();
};

// 滚动标题至指定位置
const scrollToHeader = (id) => {
  try {
    const headerDom = document.getElementById(id);
    if (!headerDom || !postDom.value) return false;
    const scrollHeight = headerDom.getBoundingClientRect().top + window.scrollY - 80;
    window.scroll({ top: scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  } catch (error) {
    console.error("目录滚动失败：", error);
  }
};

// 计算目录滚动位置
watch(
  () => activeHeader.value,
  (val) => {
    const tocAllDom = document.getElementById("toc-all");
    const activeTocItem = document.getElementById("toc-" + val);
    if (!tocAllDom || !activeTocItem) return false;
    activeTocHeight.value = activeTocItem?.offsetTop - 2 || 0;
    tocAllDom.scrollTo({ top: Math.max(0, activeTocHeight.value - 80), behavior: "auto" });
  },
);

watch(
  () => route.path,
  async () => {
    await nextTick();
    generateDirData();
  },
);

onMounted(() => {
  generateDirData();
  window.addEventListener("scroll", activeTocItem, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });
});

onBeforeUnmount(() => {
  disposed = true;
  window.removeEventListener("scroll", activeTocItem);
  window.removeEventListener("resize", scheduleMeasure);
  contentObserver?.disconnect();
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  if (measureFrame) cancelAnimationFrame(measureFrame);
});
</script>

<style lang="scss" scoped>
.toc {
  position: relative;
  padding: 0 !important;
  overflow: hidden;
  .toc-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 18px;
    height: 58px;
    .iconfont {
      margin-right: 8px;
      font-weight: bold;
      opacity: 0.6;
    }
    .name {
      font-weight: bold;
    }
  }
  .toc-list {
    position: relative;
    padding: 20px;
    padding-top: 0;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    max-height: calc(70vh - 58px);
    overflow: auto;
    .toc-item {
      margin: 4px 0;
      padding: 6px 12px;
      border-radius: 8px;
      opacity: 0.6;
      transition:
        color 0.3s,
        opacity 0.3s,
        font-size 0.3s,
        background-color 0.3s;
      cursor: pointer;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
      &.H2 {
        font-weight: bold;
      }
      &.H3 {
        font-size: 14px;
        margin-left: 20px;
      }
      &.active {
        opacity: 1;
        color: var(--main-color);
        background-color: var(--main-color-bg);
        &.H2 {
          font-size: 18px;
        }
        &.H3 {
          font-size: 16px;
        }
      }
      &:hover {
        opacity: 1;
        color: var(--main-color);
        background-color: var(--main-color-bg);
      }
    }
    &::after {
      content: "";
      position: absolute;
      left: 12px;
      top: var(--height);
      width: 4px;
      height: 20px;
      margin: 8px 0;
      background-color: var(--main-color);
      border-radius: 8px;
      transition: top 0.3s;
    }
  }
  &::before {
    content: "";
    position: absolute;
    left: 12px;
    bottom: 20px;
    width: 4px;
    height: calc(100% - 78px);
    background-color: var(--main-card-border);
    border-radius: 8px;
  }
}
</style>
