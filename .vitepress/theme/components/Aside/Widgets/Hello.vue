<!-- 侧边栏 - 欢迎 -->
<template>
  <div class="hello s-card" @mouseleave="resetHello">
    <span class="tip" @click="changeHello">{{ helloText }}</span>
    <div class="content">
      <div class="site-logo">
        <img
          class="author-avatar"
          :src="theme.siteMeta.author.cover"
          :alt="`${theme.siteMeta.author.name}的头像`"
          width="160"
          height="160"
          decoding="async"
        />
      </div>
      <span class="site-desc" v-html="theme.aside.hello.text" />
    </div>
    <div class="info">
      <div class="name">
        <span class="author">{{ theme.siteMeta.author.name }}</span>
        <span class="desc">{{ theme.siteMeta.description }}</span>
      </div>
      <SocialLinks :links="theme.aside.hello.social" />
    </div>
  </div>
</template>

<script setup>
import { getGreetings } from "@/utils/helper";
import SocialLinks from "./SocialLinks.vue";

const { theme } = useData();

// 问候数据
const helloClick = ref(0);
const helloTimeOut = ref(null);
const helloText = ref("你好，欢迎来到" + theme.value.siteMeta.title);

// 恢复问候语
const resetHello = () => {
  helloClick.value = 0;
  if (isHasUser()) return false;
  helloText.value = getGreetings();
};

// 更改问候语
const changeHello = () => {
  clearTimeout(helloTimeOut.value);
  helloClick.value++;
  if (helloClick.value === 1) {
    helloText.value = "点这里干什么？";
  } else if (helloClick.value === 2) {
    helloText.value = "怎么还点？";
  } else if (helloClick.value === 3) {
    helloText.value = "那你点吧！";
  } else if (helloClick.value === 20) {
    helloText.value = "这么坚持？";
  } else if (helloClick.value === 50) {
    helloText.value = "让我们去看看文章？";
  } else if (helloClick.value === 100) {
    helloText.value = "怎么还在点？？？";
  } else if (helloClick.value === 120) {
    helloText.value = "随你了";
  } else {
    helloText.value = `x ${helloClick.value - 3}`;
  }
  // 恢复默认
  helloTimeOut.value = setTimeout(() => {
    resetHello();
  }, 3000);
};

// 是否具有用户
const isHasUser = () => {
  let nick;
  try {
    const saved = JSON.parse(window.localStorage.getItem("twikoo-user") || "null");
    if (typeof saved?.nick !== "string" || !saved.nick.trim()) return false;
    nick = saved.nick;
  } catch {
    return false;
  }
  const hello = ["很高兴见到你", "好久不见", "欢迎回来"];
  // 随机问候语
  helloText.value = hello[Math.floor(Math.random() * hello.length)] + "，" + nick;
  return true;
};

onMounted(() => {
  helloText.value = getGreetings();
  isHasUser();
});

onBeforeUnmount(() => {
  clearTimeout(helloTimeOut.value);
});
</script>

<style lang="scss" scoped>
.hello {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--main-color);
  color: var(--main-on-accent-color);
  border: none;
  .tip {
    display: inline-block;
    min-width: 140px;
    text-align: center;
    padding: 6px 12px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    background-color: var(--main-color-opacity);
    margin-bottom: 12px;
    transition:
      color 0.3s,
      transform 0.3s,
      background-color 0.3s;
    &:hover {
      transform: scale(1.1);
      color: var(--main-font-color);
      background-color: var(--main-card-background);
    }
    &:active {
      transform: scale(1);
    }
  }
  .content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    .site-logo {
      position: absolute;
      width: 160px;
      height: 160px;
      transition:
        transform cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s,
        opacity cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s;
      transform-origin: bottom;
      .author-avatar {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }
    .site-desc {
      display: block;
      height: 100%;
      margin-top: 20px;
      font-size: 1.1rem;
      line-height: 1.5;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
    .name {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      flex-direction: column;
      .author {
        font-weight: bold;
        font-size: 20px;
      }
      .desc {
        font-size: 12px;
        opacity: 0.6;
      }
    }

  }
  &:hover {
    .content {
      .site-logo {
        opacity: 0;
        transform: scale(0);
      }
      .site-desc {
        opacity: 1;
      }
    }
  }
}
</style>
