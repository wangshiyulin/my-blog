<template>
  <div class="archives s-card">
    <div class="archives-heading">
      <h1 class="name">文章</h1>
      <sup v-if="theme.postData?.length" class="num">{{ theme.postData.length }}</sup>
    </div>
    <div class="archives-list">
      <section v-for="group in visibleYears" :key="group.year" class="year-list">
        <h2 class="year">{{ group.year }}</h2>
        <div class="posts">
          <article
            v-for="post in group.posts"
            :key="post.id"
            class="posts-item s-card hover"
            role="link"
            tabindex="0"
            @click="router.go(post.regularPath)"
            @keydown.enter="router.go(post.regularPath)"
          >
            <a :href="post.regularPath" class="title" @click.stop>{{ post.title }}</a>
            <div class="tags">
              <a
                v-for="tag in post.tags"
                :key="tag"
                :href="taxonomyHref('tags', tag)"
                class="type-item"
                @click.stop
              >
                <i class="iconfont icon-hashtag" />
                <span class="name">{{ tag }}</span>
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
    <Pagination v-if="totalPages > 1" :total="orderedIds.length" :page="currentPage"
      :limit="PAGE_SIZE" route-path="/pages/archives" use-params />
  </div>
</template>

<script setup>
import { useRouter } from "vitepress";
import { resolvePostIds } from "@/utils/postIndexes.mjs";
import { taxonomyHref } from "@/utils/taxonomyPaths.mjs";

const router = useRouter();
const { theme } = useData();
const PAGE_SIZE = 20;
const currentPage = ref(1);
const postsById = computed(() => new Map((theme.value.postData || []).map((post) => [post.id, post])));
const years = computed(() => theme.value.archivesData?.year || []);
const orderedIds = computed(() => years.value.flatMap((year) =>
  theme.value.archivesData.data[year]?.articles || [],
).filter((id) => postsById.value.has(id)));
const totalPages = computed(() => Math.max(1, Math.ceil(orderedIds.value.length / PAGE_SIZE)));
const visibleYears = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  const pageIds = new Set(orderedIds.value.slice(start, start + PAGE_SIZE));
  return years.value.map((year) => {
    const postIds = (theme.value.archivesData.data[year]?.articles || [])
      .filter((id) => pageIds.has(id));
    return { year, posts: resolvePostIds(postsById.value, postIds) };
  }).filter((group) => group.posts.length);
});

const syncPage = () => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const raw = url.searchParams.get("page");
  const requested = Number(raw || 1);
  currentPage.value = Number.isSafeInteger(requested) && requested > 0
    ? Math.min(requested, totalPages.value) : 1;
  if (raw !== null && raw !== String(currentPage.value)) {
    if (currentPage.value === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(currentPage.value));
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }
};
onMounted(() => {
  syncPage();
  window.addEventListener("vitepress-route-change", syncPage);
});
watch(totalPages, syncPage);
onBeforeUnmount(() => window.removeEventListener("vitepress-route-change", syncPage));
</script>

<style lang="scss" scoped>
.archives {
  padding: 2rem;
  .archives-heading {
    display: flex;
    margin-bottom: 1rem;
    .name {
      margin: 0;
      border-bottom: none;
    }
    .num {
      margin-left: 8px;
      font-size: 20px;
      font-weight: bold;
      opacity: 0.6;
    }
  }
}

.year-list {
  margin-bottom: 2rem;
  &:last-child { margin-bottom: 0; }
  .year {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 0 1rem 6px;
    padding-left: 12px;
    font-size: 20px;
    font-weight: bold;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      width: 4px;
      height: 70%;
      background-color: var(--main-color);
      border-radius: 8px;
    }
  }
  .posts-item {
    padding: 20px;
    margin-bottom: 1rem;
    cursor: pointer;
    &:focus-visible { outline: 2px solid var(--main-color); }
    .title {
      display: block;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: bold;
      transition: color 0.3s;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      opacity: 0.6;
      .type-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-right: 8px;
        .iconfont { margin-right: 2px; }
        &:hover { color: var(--main-color); }
      }
    }
    &:last-child { margin-bottom: 0; }
    &:hover .title { color: var(--main-color); }
  }
}
</style>
