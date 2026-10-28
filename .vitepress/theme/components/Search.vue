<!-- 全局搜索：界面按需挂载，全文索引在会话内复用。 -->
<template>
  <Modal
    :show="store.searchShow"
    title="全局搜索"
    title-icon="search"
    @mask-click="store.changeShowStatus('searchShow')"
    @modal-close="store.changeShowStatus('searchShow')"
  >
    <template #title>
      <div class="search-header">
        <i class="iconfont icon-search" />
        <input
          ref="searchInput"
          v-model="query"
          class="search-input"
          type="search"
          aria-label="搜索文章"
          placeholder="输入关键词搜索文章"
          @compositionstart="startComposition"
          @compositionend="endComposition"
          @keydown.esc.stop="closeSearch"
        />
      </div>
    </template>
    <div class="search-content" :aria-busy="loading">
      <div v-if="loading" class="search-status" role="status">正在加载搜索索引...</div>
      <div v-else-if="error" class="search-status search-error" role="alert">
        <span>{{ error }}</span>
        <button type="button" class="search-more" @click="loadIndex">重新加载</button>
      </div>
      <template v-else-if="query.trim()">
        <div v-if="results.length" class="search-list">
          <a
            v-for="item in results"
            :key="item.id"
            :href="item.url"
            class="search-item s-card hover"
            @click.prevent="jumpSearch(item.url)"
          >
            <p class="title" v-html="item.title" />
            <p v-if="item.description" class="anchor" v-html="item.description" />
            <p v-if="item.content" class="content s-card" v-html="item.content" />
          </a>
        </div>
        <div v-else class="search-empty" role="status">
          {{ waiting || composing ? "正在等待输入完成..." : "搜索结果为空" }}
        </div>
        <button
          v-if="visibleCount < matches.length"
          type="button"
          class="search-more"
          @click="visibleCount += 8"
        >
          显示更多（剩余 {{ matches.length - visibleCount }} 条）
        </button>
        <div v-if="!waiting && !composing" class="information" aria-live="polite">
          <span class="text"
            >找到 {{ matches.length }} 个结果 · 已显示 {{ results.length }} 条 ·
            {{ searchTime }} 毫秒</span
          >
        </div>
      </template>
      <div v-else class="search-empty">输入关键词搜索文章</div>
    </div>
  </Modal>
</template>

<script setup>
import { mainStore } from "@/store";
import {
  loadSearchEngine,
  normalizeText,
  highlightText,
  getContentSnippet,
} from "@/utils/searchEngine.mjs";

const store = mainStore();
const router = useRouter();
const { theme } = useData();
const searchInput = ref(null);
const query = ref("");
const activeQuery = ref("");
const loading = ref(false);
const waiting = ref(false);
const composing = ref(false);
const error = ref("");
const matches = shallowRef([]);
const visibleCount = ref(8);
const searchTime = ref(0);
let engine = null;
let timer;
let disposed = false;
let loadSequence = 0;

const results = computed(() =>
  matches.value.slice(0, visibleCount.value).map(({ item }) => ({
    id: item.id,
    url: item.url,
    title: highlightText(item.title, activeQuery.value),
    description: highlightText(item.description, activeQuery.value),
    content: highlightText(getContentSnippet(item.content, activeQuery.value), activeQuery.value),
  })),
);

const doSearch = () => {
  waiting.value = false;
  if (disposed || composing.value || !store.searchShow) return;
  activeQuery.value = query.value.trim();
  const keyword = normalizeText(activeQuery.value);
  visibleCount.value = 8;
  if (!keyword || !engine) {
    matches.value = [];
    searchTime.value = 0;
    return;
  }
  const started = performance.now();
  // Do not limit candidates before counting: all matching articles remain accessible.
  matches.value = engine
    .search(keyword)
    .filter(({ item }) =>
      [item._title, item._description, item._content, item._tags, item._categories].some((field) =>
        field.includes(keyword),
      ),
    );
  searchTime.value = Math.round(performance.now() - started);
};

const scheduleSearch = () => {
  clearTimeout(timer);
  matches.value = [];
  visibleCount.value = 8;
  waiting.value = false;
  if (composing.value || loading.value || !engine) return;
  if (!query.value.trim()) {
    doSearch();
    return;
  }
  waiting.value = true;
  timer = setTimeout(doSearch, 130);
};
const startComposition = () => {
  composing.value = true;
  clearTimeout(timer);
  matches.value = [];
};
const endComposition = (event) => {
  query.value = event.target.value;
  composing.value = false;
  scheduleSearch();
};
const closeSearch = (event) => {
  if (!event.isComposing && !composing.value) store.changeShowStatus("searchShow");
};
watch(query, scheduleSearch);

const loadIndex = async () => {
  if (loading.value) return;
  const sequence = ++loadSequence;
  loading.value = true;
  error.value = "";
  void nextTick(() => searchInput.value?.focus());
  try {
    const loaded = await loadSearchEngine(theme.value.searchIndexUrl || "/search-index.json");
    if (disposed || sequence !== loadSequence) return;
    engine = loaded;
    if (query.value.trim()) doSearch();
  } catch {
    if (!disposed && sequence === loadSequence)
      error.value = "搜索索引加载失败，请检查网络后重试。";
  } finally {
    if (!disposed && sequence === loadSequence) loading.value = false;
  }
};
const jumpSearch = (url) => {
  store.changeShowStatus("searchShow");
  void router.go(url);
};
watch(
  () => store.searchShow,
  (show) => {
    if (show) void loadIndex();
    else {
      clearTimeout(timer);
      query.value = "";
      matches.value = [];
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  disposed = true;
  loadSequence++;
  clearTimeout(timer);
});
</script>

<style lang="scss" scoped>
/*
 * 顶部标题区域
 */
.search-header {
  display: flex;

  align-items: center;

  width: 100%;

  height: 100%;

  min-width: 0;

  .iconfont {
    flex-shrink: 0;

    margin-right: 8px;

    font-size: 1.25rem;
  }
}

.search-input {
  flex: 1;

  min-width: 0;

  width: 100%;

  border: none;

  outline: none;

  background: transparent;

  color: var(--main-font-color);

  font-size: 1rem;

  font-family: inherit;

  padding: 0;

  // Use the modal close button; native search cancel icons otherwise duplicate it.
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  &::placeholder {
    color: var(--main-font-second-color);

    opacity: 0.65;
  }
}

/* 搜索内容 */
.search-content {
  width: 100%;
}

/*
 * 没有输入关键词时
 */
.search-empty {
  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-height: 180px;

  color: var(--main-font-second-color);

  gap: 10px;

  .iconfont {
    font-size: 2rem;

    opacity: 0.5;
  }
}

/*
 * 加载状态
 */
.search-status {
  display: flex;

  align-items: center;

  justify-content: center;

  min-height: 120px;

  color: var(--main-font-second-color);
}

/*
 * 搜索信息
 */
.information {
  padding-top: 12px;

  .text {
    color: var(--main-font-second-color);

    font-size: 0.8rem;
  }
}

/**
 * 搜索关键词高亮
 *
 * 使用低饱和度的柔和暖色，
 * 避免主题色过亮导致视觉刺激。
 */
:deep(mark) {
  padding: 1px 3px;

  border-radius: 4px;

  background: rgba(214, 178, 105, 0.22);

  color: inherit;

  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/**
 * 搜索结果列表
 */
.search-list {
  display: flex;

  flex-direction: column;

  gap: 12px;

  width: 100%;

  padding: 4px 0;
}

/**
 * 单个搜索结果
 */
.search-item {
  width: 100%;

  box-sizing: border-box;

  padding: 16px 18px;

  border-radius: 14px;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  /**
   * 如果 Curve 已经有背景，
   * 这里不会强行改变主题颜色。
   */
  &:hover {
    transform: translateY(-1px);
  }

  .title {
    margin: 0;

    font-size: 1rem;

    font-weight: 600;

    line-height: 1.5;
  }

  .anchor {
    margin: 6px 0 0;

    font-size: 0.85rem;

    line-height: 1.5;

    color: var(--main-font-second-color);

    display: -webkit-box;

    -webkit-box-orient: vertical;

    -webkit-line-clamp: 2;

    overflow: hidden;
  }

  .content {
    margin: 8px 0 0;

    padding: 0;

    font-size: 0.82rem;

    line-height: 1.6;

    color: var(--main-font-second-color);

    display: -webkit-box;

    -webkit-box-orient: vertical;

    -webkit-line-clamp: 3;

    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>
.search-item {
  display: block;
  color: var(--main-font-color);
}
.search-error {
  flex-direction: column;
  gap: 12px;
}
.search-more {
  display: block;
  margin: 12px auto 0;
  padding: 10px 16px;
  border: 1px solid var(--main-card-border);
  border-radius: 8px;
  background: var(--main-card-second-background);
  color: var(--main-font-color);
  cursor: pointer;
}
</style>
