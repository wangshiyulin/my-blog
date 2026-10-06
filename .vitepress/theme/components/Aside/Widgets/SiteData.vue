<!-- 侧边栏 - 站点数据 -->
<template>
  <div class="site-data s-card">
    <div class="title">
      <i class="iconfont icon-chart"></i>
      <span class="title-name">站点数据</span>
    </div>
    <div class="all-data">
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-article"></i>
          文章总数
        </span>
        <span class="num">{{ theme.postData?.length || 0 }} 篇</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-date"></i>
          建站天数
        </span>
        <span class="num">{{ daysFromNow(theme.since) }} 天</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-visibility"></i>
          总访问量
        </span>
        <span class="num" id="busuanzi_value_site_pv">0</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-account"></i>
          总访客数
        </span>
        <span class="num" id="busuanzi_value_site_uv">0</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadScript } from "@/utils/commonTools";
import { daysFromNow } from "@/utils/helper";

const COUNTER_SCRIPT = "https://events.vercount.one/js";
const { theme } = useData();

let handleRouteChange = null;
let loadedPath = "";

const getCurrentPath = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
};

const loadCounter = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const currentPath = getCurrentPath();
  if (!currentPath || currentPath === loadedPath) return;

  // Vercount 兼容不蒜子的 busuanzi_value_site_pv / site_uv 标签。
  // 使用主题原本的 loadScript 机制，保证脚本在 DOM 节点存在后再加载。
  const result = loadScript(COUNTER_SCRIPT, {
    async: true,
    reload: true,
  });

  if (result && typeof result.catch === "function") {
    void result.then(
      () => {
        loadedPath = currentPath;
      },
      (error) => {
        console.error("网站访问统计加载失败：", error);
      },
    );
  } else {
    loadedPath = currentPath;
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;

  loadCounter();
  handleRouteChange = loadCounter;
  window.addEventListener("vitepress-route-change", handleRouteChange);
});

onBeforeUnmount(() => {
  if (typeof window === "undefined" || !handleRouteChange) return;
  window.removeEventListener("vitepress-route-change", handleRouteChange);
  handleRouteChange = null;
});
</script>

<style lang="scss" scoped>
.site-data {
  .all-data {
    .data-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.2rem;
      .name {
        display: flex;
        flex-direction: row;
        align-items: center;
        .iconfont {
          margin-right: 8px;
          opacity: 0.6;
          font-size: 18px;
        }
      }
      .num {
        opacity: 0.8;
        font-size: 15px;
      }
      #busuanzi_value_site_pv {
        &::after {
          content: " 次";
        }
      }
      #busuanzi_value_site_uv {
        &::after {
          content: " 人";
        }
      }
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
}
</style>
