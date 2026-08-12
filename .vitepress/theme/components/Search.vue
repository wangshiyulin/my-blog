<!-- 全局搜索 -->
<template>
  <Modal
    :show="store.searchShow"
    :title="isSearching ? '' : '全局搜索'"
    :title-icon="isSearching ? '' : 'search'"
    @mask-click="store.changeShowStatus('searchShow')"
    @modal-close="store.changeShowStatus('searchShow')"
  >
    <!-- 顶部标题 / 搜索框 -->
    <template #title>
      <div class="search-header">
        <i class="iconfont icon-search" />
    
        <input
          ref="searchInput"
          v-model="query"
          class="search-input"
          type="text"
          autofocus
          @keydown.esc.stop="closeSearch"
        />
      </div>
    </template>

    <!-- 搜索结果 -->
    <div class="search-content">
      <!-- 搜索中 -->
      <div
        v-if="loading"
        class="search-status"
      >
        正在加载搜索索引...
      </div>

      <!-- 已输入关键词 -->
      <Transition
        v-else
        name="fade"
        mode="out-in"
      >
        <div
          v-if="query.trim()"
          class="search-results"
        >
          <!-- 有搜索结果 -->
          <div
            v-if="results.length"
            class="search-list"
          >
            <div
              v-for="item in results"
              :key="item.id"
              class="search-item s-card hover"
              @click="jumpSearch(item.url)"
            >
              <!-- 标题 -->
              <p
                class="title"
                v-html="item.title"
              />

              <!-- 描述 -->
              <p
                v-if="item.description"
                class="anchor"
                v-html="item.description"
              />

              <!-- 正文摘要 -->
              <p
                v-if="item.content"
                class="content s-card"
                v-html="item.content"
              />
            </div>
          </div>

          <!-- 无结果 -->
          <div
            v-else
            class="no-result"
          >
            <i class="iconfont icon-search-empty" />

            <span class="text">
              搜索结果为空
            </span>
          </div>
        </div>

        <!-- 没有输入关键词 -->
        <div
          v-else
          class="search-empty"
        >
          <i class="iconfont icon-search" />

          <span>
            输入关键词搜索文章
          </span>
        </div>
      </Transition>

      <!-- 搜索信息 -->
      <div
        v-if="query.trim()"
        class="information"
      >
        <span class="text">
          找到 {{ results.length }} 个结果 ·
          {{ searchTime }} 毫秒
        </span>
      </div>

      <!-- 搜索来源 -->
      <!-- <div class="power">
        <span class="name">
          本站搜索
        </span>
      </div> -->
    </div>
  </Modal>
</template>

<script setup>
import Fuse from "fuse.js";
import { mainStore } from "@/store";

const store = mainStore();
const router = useRouter();

/**
 * 搜索框
 */
const searchInput = ref(null);

/**
 * 搜索关键词
 */
const query = ref("");

/**
 * 原始搜索数据
 */
const searchData = ref([]);

/**
 * Fuse 实例
 */
const fuse = shallowRef(null);

/**
 * 搜索结果
 */
const results = ref([]);

/**
 * 搜索耗时
 */
const searchTime = ref(0);

/**
 * 搜索索引加载状态
 */
const loading = ref(false);

/**
 * 搜索时忽略空白字符
 *
 * Cloudflare Worker
 * ↓
 * cloudflareworker
 */
const normalizeText = (text) => {
  return String(text || "")
    .replace(/\s+/g, "")
    .toLowerCase();
};

/**
 * 加载搜索索引
 */
const loadSearchIndex = async () => {
  if (searchData.value.length || loading.value) {
    return;
  }

  loading.value = true;

  try {
    const response = await fetch("/search-index.json");

    if (!response.ok) {
      throw new Error(
        `搜索索引加载失败: ${response.status}`,
      );
    }

    const data = await response.json();

    /**
     * 给 Fuse 创建专门的搜索字段。
     *
     * 原始字段不修改，
     * 只是额外增加 normalized 字段。
     */
     searchData.value = data.map((item) => {
       const title = normalizeText(item.title);
     
       const description = normalizeText(
         item.description,
       );
     
       const content = normalizeText(
         item.content,
       );
     
       const tags = normalizeText(
         Array.isArray(item.tags)
           ? item.tags.join(" ")
           : item.tags,
       );
     
       const categories = normalizeText(
         Array.isArray(item.categories)
           ? item.categories.join(" ")
           : item.categories,
       );
     
       return {
         ...item,
     
         _title: title,
     
         _description: description,
     
         _content: content,
     
         _tags: tags,
     
         _categories: categories,
     
         /**
          * 所有可以被搜索的内容
          */
         _searchText: [
           title,
           description,
           content,
           tags,
           categories,
         ].join(""),
       };
     });

     fuse.value = new Fuse(searchData.value, {
       includeScore: true,
     
       shouldSort: true,
     
       // 禁止过于宽松的模糊匹配
       threshold: 0.2,
     
       // 搜索短关键词时也允许匹配
       minMatchCharLength: 1,
     
       ignoreLocation: true,
     
       keys: [
         {
           name: "_title",
           weight: 4,
         },
         {
           name: "_description",
           weight: 2,
         },
         {
           name: "_tags",
           weight: 2,
         },
         {
           name: "_categories",
           weight: 2,
         },
         {
           name: "_content",
           weight: 1,
         },
       ],
     });
  } catch (error) {
    console.error(
      "加载搜索索引失败:",
      error,
    );
  } finally {
    loading.value = false;
  }
};

/**
 * HTML 转义
 */
const escapeHtml = (text) => {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * 将搜索词转换成：
 *
 * cloudflareworker
 *
 * ↓
 *
 * cloudflare\s*worker
 *
 * 这样：
 *
 * Cloudflare Worker
 * CloudflareWorker
 * Cloudflare  Worker
 *
 * 都可以高亮。
 */
const createHighlightRegex = (keyword) => {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return null;
  }

  const chars = [...normalizedKeyword];

  const pattern = chars
    .map((char) =>
      char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("\\s*");

  return new RegExp(pattern, "giu");
};

/**
 * 高亮文本
 */
const highlightText = (text, keyword) => {
  if (!text || !keyword) {
    return escapeHtml(text || "");
  }

  const regex = createHighlightRegex(keyword);

  if (!regex) {
    return escapeHtml(text);
  }

  let result = "";

  let lastIndex = 0;

  let match;

  while ((match = regex.exec(text)) !== null) {
    /**
     * 普通文本
     */
    result += escapeHtml(
      text.slice(
        lastIndex,
        match.index,
      ),
    );

    /**
     * 匹配文本
     */
    result += `<mark>${escapeHtml(
      match[0],
    )}</mark>`;

    lastIndex =
      match.index + match[0].length;
  }

  /**
   * 最后的普通文本
   */
  result += escapeHtml(
    text.slice(lastIndex),
  );

  return result;
};

/**
 * 获取正文摘要
 */
const getContentSnippet = (
  content,
  keyword,
) => {
  if (!content) {
    return "";
  }

  /**
   * 同样忽略空格寻找关键词
   */
  const normalizedContent =
    normalizeText(content);

  const normalizedKeyword =
    normalizeText(keyword);

  const index =
    normalizedContent.indexOf(
      normalizedKeyword,
    );

  /**
   * 找不到精确位置
   *
   * 可能是 Fuse 的模糊匹配，
   * 那么直接取文章开头。
   */
  if (index === -1) {
    return (
      content.slice(0, 180) +
      (content.length > 180
        ? "..."
        : "")
    );
  }

  /**
   * 因为 normalizedContent 去掉了空格，
   * 所以不能直接拿 index 截原文。
   *
   * 这里采用简单策略：
   * 找关键词第一个字符在原文的位置。
   */
  const firstChar =
    normalizedKeyword.charAt(0);

  const originalIndex =
    content
      .toLowerCase()
      .indexOf(firstChar);

  const safeIndex =
    originalIndex >= 0
      ? originalIndex
      : 0;

  const start = Math.max(
    0,
    safeIndex - 80,
  );

  const end = Math.min(
    content.length,
    safeIndex +
      normalizedKeyword.length +
      120,
  );

  let snippet = content.slice(
    start,
    end,
  );

  if (start > 0) {
    snippet = "..." + snippet;
  }

  if (end < content.length) {
    snippet += "...";
  }

  return snippet;
};

/**
 * 执行搜索
 */
const doSearch = (value) => {
  const startTime =
    performance.now();

  if (
    !value.trim() ||
    !fuse.value
  ) {
    results.value = [];

    searchTime.value = 0;

    return;
  }

  const keyword = value.trim();

  const normalizedKeyword =
    normalizeText(keyword);
  
  const fuseResults =
    fuse.value.search(
      normalizedKeyword,
      {
        limit: 50,
      },
    );
  
  /**
   * 严格过滤：
   *
   * 搜索词必须真实存在于：
   *
   * 标题
   * 描述
   * 正文
   * 标签
   * 分类
   *
   * 中。
   *
   * Fuse 只负责排序，
   * 不负责决定是否显示。
   */
  const exactResults =
    fuseResults
      .filter(({ item }) =>
        item._searchText.includes(
          normalizedKeyword,
        ),
      )
      .slice(0, 8);

  results.value =
    exactResults.map(
      ({ item }) => ({
        ...item,

        title: highlightText(
          item.title,
          keyword,
        ),

        description:
          item.description
            ? highlightText(
                item.description,
                keyword,
              )
            : "",

        content:
          item.content
            ? highlightText(
                getContentSnippet(
                  item.content,
                  keyword,
                ),
                keyword,
              )
            : "",
      }),
    );

  searchTime.value = Math.round(
    performance.now() -
      startTime,
  );
};

/**
 * 监听关键词
 */
watch(query, (value) => {
  doSearch(value);
});

/**
 * 跳转搜索结果
 */
const jumpSearch = (url) => {
  store.changeShowStatus(
    "searchShow",
  );

  router.go(url);
};

/**
 * 搜索窗口打开
 */
 watch(
   () => store.searchShow,
   async (show) => {
     if (!show) {
       query.value = "";
       results.value = [];
       return;
     }
 
     // 打开搜索框时立即加载索引
     await loadSearchIndex();
 
     // 等 Modal 和 input 真正渲染完成
     await nextTick();
 
     // 自动聚焦
     searchInput.value?.focus();
   },
 );

/**
 * 组件卸载
 */
onBeforeUnmount(() => {
  query.value = "";

  results.value = [];

  isSearching.value = false;
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
 
 .search-title {
   flex-shrink: 0;
 
   margin-right: 18px;
 
   font-size: 1.125rem;
 
   font-weight: 600;
 
   white-space: nowrap;
 
   user-select: none;
 }
 
 .search-input {
   flex: 1;
 
   min-width: 0;
 
   width: 100%;
 
   border: none;
 
   outline: none;
 
   background: transparent;
 
   color: var(--main-text-color);
 
   font-size: 1rem;
 
   font-family: inherit;
 
   padding: 0;
 
   &::placeholder {
     color: var(--main-text-second-color);
 
     opacity: 0.65;
   }
 }

/*
 * 清空按钮
 */
.search-clear {
  flex-shrink: 0;

  margin-left: 10px;

  padding: 6px;

  border-radius: 8px;

  font-size: 0.9rem;

  cursor: pointer;

  transition:
    background-color 0.3s;

  &:hover {
    background-color:
      var(--main-card-border);
  }
}

/*
 * 搜索内容
 */
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

  color: var(--main-text-second-color);

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

  color:
    var(--main-text-second-color);
}

/*
 * 搜索信息
 */
.information {
  padding-top: 12px;

  .text {
    color:
      var(--main-text-second-color);

    font-size: 0.8rem;
  }
}

/*
 * 搜索来源
 */
.power {
  display: flex;

  justify-content: flex-end;

  margin-top: 8px;

  .name {
    color:
      var(--main-text-second-color);

    font-size: 0.75rem;

    opacity: 0.7;
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

    color:
      var(--main-text-second-color);

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

    color:
      var(--main-text-second-color);

    display: -webkit-box;

    -webkit-box-orient: vertical;

    -webkit-line-clamp: 3;

    overflow: hidden;
  }
}
</style>