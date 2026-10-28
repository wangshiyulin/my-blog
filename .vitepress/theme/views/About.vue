<template>
  <article class="about" aria-labelledby="about-title">
    <header class="about-heading">
      <h1 id="about-title" class="page-title">关于本站</h1>
    </header>

    <section class="about-intro glass-panel s-card" aria-labelledby="about-name">
      <div class="intro-copy">
        <p class="intro-greeting">你好，很高兴认识你</p>
        <h2 id="about-name" class="intro-name">我是 <span>往世雨</span></h2>
        <p class="intro-role">是一名 交易员、独立开发者、博主</p>
      </div>
      <div class="intro-profile">
        <div class="intro-portrait">
          <img
            :src="theme.siteMeta.author.cover"
            :alt="theme.siteMeta.author.name + '的头像'"
            width="160"
            height="160"
            decoding="async"
          />
        </div>
        <SocialLinks :links="theme.aside.hello.social" />
      </div>
    </section>

    <section class="about-pursuit glass-panel s-card" aria-labelledby="pursuit-title">
      <h2 id="pursuit-title" class="section-label">追求</h2>
      <div class="pursuit-lines">
        <p>在27岁之前财务自由</p>
        <p>做热爱的事</p>
        <p>过梦想的生活</p>
      </div>
    </section>

    <div class="about-details">
      <section class="about-skills glass-panel s-card" aria-labelledby="skills-title">
        <p class="section-label">技能</p>
        <h2 id="skills-title" class="section-title">创造力的本源</h2>
        <div class="skills-list">
          <a
            v-for="item in skillsData"
            :key="item.name"
            :style="{ '--color': item.color }"
            :href="item.link"
            class="skills-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="skills-logo">
              <svg
                v-if="item.icon === 'typescript'"
                viewBox="0 0 32 32"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="28" height="28" rx="2" fill="white" />
                <text
                  x="6"
                  y="24"
                  font-family="Arial, sans-serif"
                  font-weight="bold"
                  font-size="18"
                  fill="#3178c6"
                >
                  TS
                </text>
              </svg>
              <svg
                v-else-if="item.icon === 'rust'"
                viewBox="0 0 32 32"
                width="24"
                height="24"
                aria-hidden="true"
              >
                <path
                  fill="white"
                  d="M13 1h6l1 4 3 1 4-2 4 5-3 3 1 3 3 1v6l-4 1-1 3 1 3-5 3-3-3h-3l-2 3-6-2v-4l-3-2-4 1-2-6 3-2v-3L0 11l3-5 4 1 3-2z"
                />
                <circle cx="16" cy="16" r="10" :fill="item.color" />
                <text
                  x="9"
                  y="23"
                  font-family="Georgia, serif"
                  font-weight="bold"
                  font-size="21"
                  fill="white"
                >
                  R
                </text>
              </svg>
              <img
                v-else-if="item.image"
                :src="item.image"
                width="24"
                height="24"
                alt=""
                decoding="async"
              />
              <i v-else :class="`iconfont icon-${item.icon}`"></i>
            </span>
            <span class="skills-name">{{ item.name }}</span>
          </a>
        </div>
      </section>

      <div class="about-profile">
        <section class="about-career glass-panel s-card" aria-labelledby="career-title">
          <p class="section-label">生涯</p>
          <h2 id="career-title" class="section-title career-motto"><i>GOGOGO！</i></h2>
          <p class="career-school">NJUCM · 计算机科学与技术</p>
        </section>
        <section class="about-character glass-panel s-card" aria-labelledby="character-title">
          <p class="section-label">性格</p>
          <div class="character-heading">
            <h2 id="character-title" class="section-title">架构师</h2>
            <span class="character-type">INTJ</span>
          </div>
          <p class="character-more">
            在
            <a href="https://www.16personalities.com/ch/" target="_blank" rel="noopener noreferrer"
              >16personalities</a
            >
            了解更多关于
            <a
              href="https://www.16personalities.com/ch/intj-%E4%BA%BA%E6%A0%BC"
              target="_blank"
              rel="noopener noreferrer"
              >架构师</a
            >
          </p>
        </section>
      </div>
    </div>

    <section class="about-story glass-panel s-card" aria-labelledby="story-title">
      <h2 id="story-title" class="section-label">关于本站</h2>
      <div class="story-content">
        <p>
          回忆一下，为什么想有个自己的博客呢？<strong>记录此刻所思，创造未来之物</strong>，大抵我是想留下什么
        </p>
        <p>
          带着好奇心，我尝试并学习过很多<strong>知识和技术</strong>，它们已经或即将被记录在这里，如果能帮到你，我也会很开心
        </p>
        <p>这是我的一方小小天地，<strong>探索世界，也寻找自己</strong></p>
      </div>
    </section>
  </article>
</template>

<script setup>
import SocialLinks from "@/components/Aside/Widgets/SocialLinks.vue";
const { theme } = useData();

const skillsData = [
  {
    name: "TypeScript",
    color: "#3178c6",
    icon: "typescript",
    link: "https://www.typescriptlang.org/",
  },
  {
    name: "Rust",
    color: "#a34b2d",
    icon: "rust",
    link: "https://www.rust-lang.org/",
  },
  {
    name: "Python",
    color: "#3776AB",
    icon: "python",
    link: "https://www.python.org/",
  },
  {
    name: "HTML5",
    color: "#e34f26",
    icon: "html5",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/HTML",
  },
  {
    name: "CSS3",
    color: "#563d7c",
    icon: "css3",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/CSS",
  },
  {
    name: "Svelte",
    color: "#ff3e00",
    link: "https://svelte.dev/",
    image: "/images/skills/svelte.svg",
  },
  {
    name: "Linux",
    color: "#393e46",
    link: "https://www.kernel.org/",
    image: "/images/skills/linux.svg",
  },
  {
    name: "Docker",
    color: "#2496f2",
    icon: "docker",
    link: "https://www.docker.com/",
  },
  {
    name: "Git",
    color: "#F05032",
    icon: "git",
    link: "https://git-scm.com/",
  },
  {
    name: "Tauri",
    color: "#172d38",
    link: "https://tauri.app/",
    image: "/images/skills/tauri.svg",
  },
  {
    name: "Cloudflare",
    color: "#352719",
    link: "https://www.cloudflare.com/",
    image: "/images/skills/cloudflare.svg",
  },
  {
    name: "ChatGPT",
    color: "#4AA181",
    icon: "chatgpt",
    link: "https://chat.openai.com/",
  },
];
</script>

<style lang="scss" scoped>
.about {
  --about-gap: clamp(16px, 2vw, 24px);
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: clamp(12px, 2vw, 28px) 0 16px;
  .about-heading {
    margin: 0 0 24px;
  }
  .page-title {
    margin: 0;
    padding: 0;
    border: 0;
    text-align: left;
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    line-height: 1.35;
    letter-spacing: 0.04em;
  }
  .glass-panel {
    position: relative;
    isolation: isolate;
    min-width: 0;
    padding: clamp(22px, 3vw, 36px);
    overflow: hidden;
    cursor: default;
    border-radius: 24px;
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background: linear-gradient(
        115deg,
        transparent 25%,
        rgba(255, 255, 255, 0.07) 48%,
        transparent 70%
      );
      transform: translateX(-105%);
      transition: transform 420ms ease-out;
    }
  }
  .section-label {
    margin: 0 0 14px;
    padding: 0;
    border: 0;
    color: var(--main-font-second-color);
    font-size: 0.875rem;
    font-weight: normal;
    line-height: 1.5;
    letter-spacing: 0.12em;
  }
  .section-title {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    line-height: 1.35;
    letter-spacing: 0.025em;
  }
  .about-intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    min-height: 262px;
    padding-block: clamp(30px, 4vw, 48px);
    background-image: linear-gradient(
      125deg,
      rgba(224, 190, 123, 0.1),
      rgba(255, 255, 255, 0.015) 65%
    );
  }
  .intro-copy {
    min-width: 0;
  }
  .intro-greeting {
    margin: 0 0 14px;
    color: var(--main-font-second-color);
  }
  .intro-name {
    margin: 0 0 16px;
    padding: 0;
    border: 0;
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    line-height: 1.3;
    letter-spacing: 0.025em;
    span {
      color: var(--main-color);
    }
  }
  .intro-role {
    margin: 0;
    line-height: 1.8;
    font-size: 1.05rem;
  }
  .intro-profile {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    min-width: 180px;
    :deep(.author-social) {
      margin-left: 0;
      gap: 10px;
    }
    :deep(.social-link) {
      width: 44px;
      height: 44px;
      .iconfont {
        font-size: 21px;
      }
      .social-icon {
        width: 21px;
        height: 21px;
      }
      border: 1px solid var(--main-card-border);
      background-color: rgba(255, 255, 255, 0.045);
    }
  }
  .intro-portrait {
    flex: 0 0 auto;
    padding: 10px;
    border: 1px solid rgba(231, 201, 147, 0.3);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.018);
    img {
      display: block;
      width: 144px;
      height: 144px;
      object-fit: cover;
      border-radius: 50%;
    }
  }
  .about-pursuit {
    margin-top: var(--about-gap);
  }
  .pursuit-lines {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1.1fr;
    gap: 20px;
    p {
      margin: 0;
      padding-left: 16px;
      border-left: 2px solid rgba(229, 196, 133, 0.5);
      font-size: clamp(1.1rem, 2.1vw, 1.45rem);
      line-height: 1.7;
      &:last-child {
        color: var(--main-color);
      }
    }
  }
  .about-details {
    display: grid;
    grid-template-columns: 1.12fr 1fr;
    gap: var(--about-gap);
    margin-top: var(--about-gap);
    > * {
      min-width: 0;
    }
  }
  .skills-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 26px;
  }
  .skills-item {
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 11px 14px;
    border: 1px solid var(--main-card-border);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.035);
    transition:
      transform 180ms ease,
      border-color 180ms,
      background-color 180ms;
    .skills-name {
      font-size: 0.95rem;
      overflow-wrap: anywhere;
    }
    &:hover {
      color: var(--main-font-color);
      border-color: rgba(231, 201, 147, 0.42);
      background-color: rgba(255, 255, 255, 0.07);
    }
  }
  .skills-logo {
    display: flex;
    flex: 0 0 32px;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--color);
    img {
      display: block;
      width: 24px;
      height: 24px;
    }
    .iconfont {
      color: #fff;
      font-size: 19px;
    }
  }
  .about-profile {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: var(--about-gap);
  }
  .career-motto {
    letter-spacing: 0.06em;
  }
  .career-school {
    margin: 18px 0 0;
    padding-left: 14px;
    border-left: 3px solid var(--main-color);
    color: var(--main-font-second-color);
    line-height: 1.7;
  }
  .character-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .character-type {
    color: var(--main-color);
    font-size: 2.2rem;
    letter-spacing: 0.06em;
  }
  .character-more {
    margin: 20px 0 0;
    color: var(--main-font-second-color);
    font-size: 0.8125rem;
    line-height: 1.9;
    overflow-wrap: anywhere;
    a {
      color: var(--main-font-second-color);
      text-decoration: underline;
      text-underline-offset: 4px;
      &:hover {
        color: var(--main-color);
      }
    }
  }
  .about-story {
    margin-top: var(--about-gap);
  }
  .story-content {
    max-width: 58rem;
    p {
      margin: 0 0 20px;
      font-size: 1.05rem;
      line-height: 2;
      &:last-child {
        margin-bottom: 0;
      }
    }
    strong {
      color: var(--main-color);
      font-weight: 600;
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .glass-panel:hover {
      transform: translateY(-3px);
      border-color: rgba(231, 201, 147, 0.36);
    }
    .glass-panel:hover::before {
      transform: translateX(105%);
    }
  }
  @media (max-width: 900px) {
    .about-details {
      grid-template-columns: 1fr;
    }
    .about-profile {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto;
    }
    .skills-list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .skills-item {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
  @media (max-width: 600px) {
    .about-intro {
      flex-direction: column;
      align-items: flex-start;
      gap: 26px;
    }
    .intro-profile {
      flex-direction: row;
      gap: 22px;
      min-width: 0;
      flex-wrap: wrap;
    }
    .intro-profile :deep(.author-social) {
      flex-wrap: wrap;
      gap: 8px;
    }
    .intro-portrait {
      padding: 6px;
      box-shadow: none;
      img {
        width: 76px;
        height: 76px;
      }
    }
    .intro-name {
      font-size: clamp(1.65rem, 6vw, 2.2rem);
    }
    .intro-role {
      font-size: 0.875rem;
    }
    .intro-greeting {
      font-size: 0.8125rem;
    }
    .pursuit-lines {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .about-profile {
      grid-template-columns: 1fr;
    }
    .skills-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .skills-item {
      flex-direction: row;
      text-align: left;
      padding: 10px;
      gap: 8px;
    }
    .skills-logo {
      flex-basis: 28px;
      width: 28px;
      height: 28px;
    }
    .skills-item .skills-name {
      font-size: 0.8125rem;
    }
  }
  @media (max-width: 380px) {
    .intro-profile {
      gap: 16px;
    }
    .skills-item {
      flex-direction: column;
      text-align: center;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .glass-panel:hover {
      transform: none;
    }
    .glass-panel::before {
      display: none;
    }
  }
}
</style>
