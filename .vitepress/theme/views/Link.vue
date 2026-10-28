<template>
  <div class="link">
    <!-- 顶图 -->
    <Banner type="page" title="友情链接" desc="与各位博主无限进步">
      <template v-slot:header-slot>
        <div class="menu">
          <div class="menu-item random" @click="randomJump">
            <i class="iconfont icon-shuffle" />
            <span class="name">随机访问</span>
          </div>
          <button type="button" class="menu-item add" @click="smoothScrolling('#友情链接申请')">
            <i class="iconfont icon-right-round" />
            <span class="name">申请友链</span>
          </button>
        </div>
      </template>
    </Banner>
    <!-- 友链数据 -->
    <Transition name="fade" mode="out-in">
      <div v-if="linkData?.length" class="link-list">
        <div v-for="(type, index) in linkData" :key="index" class="link-type-list">
          <div class="title">
            <h2 class="name">
              <span class="name-text">{{ type?.typeName || "未知分组" }}</span>
              <span class="name-count">（{{ type?.typeList?.length || 0 }}）</span>
            </h2>
            <span class="tip">{{ type?.typeDesc || "分组暂无简介" }}</span>
          </div>
          <div class="all-link" v-if="type?.typeList">
            <a
              v-for="(link, index) in type.typeList"
              class="link-card s-card cf-friends-link"
              :key="index"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="cover">
                <LazyLoader :useFriendsLink="link.avatar || link.ico">
                  <img
                    :src="link.avatar || link.ico"
                    class="cover-img cf-friends-avatar"
                    :alt="link?.name || 'cover'"
                    @load="(e) => e.target.classList.add('loaded')"
                  />
                </LazyLoader>
              </div>
              <div class="data">
                <span class="name cf-friends-name">{{ link.name }}</span>
                <span class="desc">{{ link.desc }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div v-else class="no-data">暂无友链数据</div>
    </Transition>
  </div>
</template>

<script setup>
import { smoothScrolling } from "@/utils/helper";
import linkData from "@/assets/linkData.mjs";

// 全部友链
const allLinkData = computed(() => {
  return linkData.flatMap((item) => item.typeList);
});

// 随机跳转
const randomJump = () => {
  try {
    const friendList = allLinkData.value;
    const randomList = friendList[Math.floor(Math.random() * friendList.length)];
    $message.warning(
      `您即将前往 ${randomList?.name}，请注意链接是否安全`,
      {
        close: true,
        duration: 2000,
      },
      () => {
        if (randomList?.url) window.open(randomList.url, "_blank", "noopener,noreferrer");
      },
    );
  } catch (error) {
    console.error("友链随机访问时出错：", error);
    if (typeof $message !== "undefined") $message.error("友链随机访问时出错，请重试");
  }
};
</script>

<style lang="scss" scoped>
.link {
  margin-bottom: 4rem;
  .banner-page {
    // min-height: 440px;
    min-height: auto;
    .menu {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: auto;
      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 46px;
        padding: 12px 18px;
        border-radius: 8px;
        background-color: var(--main-card-second-background);
        border: 1px solid var(--main-card-border);
        box-shadow: 0 8px 16px -4px var(--main-border-shadow);
        font: inherit;
        transition:
          color 0.2s,
          background-color 0.2s,
          box-shadow 0.2s;
        cursor: pointer;
        .iconfont {
          font-size: 18px;
          margin-right: 8px;
          transition: color 0.3s;
        }
        &.random {
          color: var(--main-color);
          .iconfont {
            color: var(--main-color);
          }
        }
        &.add {
          color: var(--main-on-accent-color);
          background-color: var(--main-color);
          .iconfont {
            font-size: 22px;
            margin-right: 6px;
            color: var(--main-on-accent-color);
          }
        }
        &:last-child {
          margin-left: 20px;
        }
        &:focus-visible {
          outline: 2px solid var(--main-font-color);
          outline-offset: 3px;
        }
        &:hover {
          color: var(--main-on-accent-color);
          background-color: var(--main-color);
          box-shadow: 0 8px 16px -4px var(--main-color-bg);
          .iconfont {
            color: var(--main-on-accent-color);
          }
        }
      }
    }
    @media (max-width: 800px) {
      min-height: auto;
      .menu,
      .link-group {
        display: none;
      }
    }
  }
}

.link-list {
  .link-type-list {
    margin-top: 2rem;
    .title {
      margin-left: 6px;
      margin-bottom: 1.6rem;
      .name {
        border-bottom: none;
        margin-bottom: 4px;
        .name-count {
          color: var(--main-font-second-color);
        }
      }
      .tip {
        color: var(--main-font-second-color);
      }
    }
    .all-link {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(5, 1fr);
      .link-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 90px;
        width: 100%;
        padding: 12px;
        .cover {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          min-width: 60px;
          margin-right: 20px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            var(--main-card-border) 25%,
            var(--main-card-background) 37%,
            var(--main-card-border) 63%
          );
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
          transition: all 0.6s;
          .cover-img {
            width: 100%;
            height: 100%;
            background-color: var(--main-card-background);
            opacity: 0;
            filter: blur(10px);
            transition:
              filter 0.3s,
              opacity 0.3s;
            &.loaded {
              opacity: 1;
              filter: blur(0);
            }
          }
        }
        .data {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          .name {
            font-weight: bold;
            font-size: 18px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            line-clamp: 1;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            white-space: nowrap;
          }
          .desc {
            font-size: 15px;
            margin-top: 4px;
            line-height: 1.2;
            color: var(--main-font-second-color);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            transition:
              color 0.3s,
              opacity 0.3s;
          }
        }
        &:hover {
          color: var(--main-on-accent-color);
          background-color: var(--main-color);
          border-color: var(--main-color);
          box-shadow: 0 0 16px 6px var(--main-color-bg);
          .cover {
            margin-right: 6px;
            min-width: 0;
            opacity: 0;
            width: 0;
            height: 0;
          }
          .data {
            .desc {
              opacity: 0.7;
              color: var(--main-on-accent-color);
            }
          }
        }
      }
      @media (max-width: 1200px) {
        grid-template-columns: repeat(4, 1fr);
      }
      @media (max-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
    }
  }
}
.no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
