import { mainStore } from "@/store";
import { throttle } from "lodash-es";

/**
 * 计算滚动高度和滚动百分比
 */
export const calculateScroll = throttle(
  () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const store = mainStore();
    const scrollY = Math.max(0, Math.round(window.scrollY || window.pageYOffset));
    const totalHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const percentage = totalHeight ? Math.round(Math.min(100, (scrollY / totalHeight) * 100)) : 0;
    const previous = store.scrollData;
    // 低幅度触控板抖动不改变导航栏显示方向。
    const movement = scrollY - previous.height;
    const direction = Math.abs(movement) >= 5
      ? movement > 0 ? "down" : "up"
      : previous.direction;
    // 避免无变化时重复触发 Pinia 订阅组件重渲染。
    if (previous.height !== scrollY || previous.percentage !== percentage || previous.direction !== direction) {
      store.scrollData = { height: scrollY, percentage, direction };
    }
  },
  100,
  { leading: true, trailing: true },
);

/**
 * 平滑滚动至目标高度或元素
 * @param {number|HTMLElement} target - 目标高度或元素
 */
export const smoothScrolling = (target = 0) => {
  try {
    if (typeof window === "undefined") return false;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (typeof target === "number") {
      // 滚动至指定高度
      window.scrollTo({ top: target, behavior });
    } else if (target instanceof HTMLElement) {
      // 滚动至元素
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior });
    } else if (typeof target === "string" && target.startsWith("#")) {
      // 滚动至 ID
      const element = document.querySelector(target);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior });
      }
    } else {
      // 滚动至顶部
      window.scrollTo({ top: 0, behavior });
    }
  } catch (error) {
    console.error("平滑滚动出错：", error);
  }
};

/**
 * 按本地日历日期显示今日、近 7 天或绝对日期。
 * 使用日历日序号，避免发布时间的时分或夏令时造成少算一天。
 */
export const formatTimestamp = (timestamp, currentTime = Date.now()) => {
  const now = new Date(currentTime);
  const targetDate = new Date(timestamp);
  if (!Number.isFinite(now.getTime()) || !Number.isFinite(targetDate.getTime())) return "-";
  const calendarDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  const difference = calendarDay(now) - calendarDay(targetDate);
  if (difference === 0) return "今日内";
  if (difference > 0 && difference < 7) return `${difference}天前`;
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  return year === now.getFullYear() ? `${month}/${day}` : `${year}/${month}/${day}`;
};

/**
 * 计算给定日期与当前日期相差的天数
 * @param {string} dateStr - 要计算差值的日期，为字符串形式
 * @returns {number} 天数差值
 */
export const daysFromNow = (dateStr, currentTime = Date.now()) => {
  const currentDate = new Date(currentTime);
  const inputDate = new Date(dateStr);
  const timeDiff = currentDate - inputDate;
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return dayDiff;
};

/**
 * 随机前往一篇文章
 * @param {Object} postData - 文章数据
 * @returns {number} 天数差值
 */
let lastIndex = -1;
export const shufflePost = (postData) => {
  if (!Array.isArray(postData) || !postData.length) return "/pages/archives";
  let randomIndex;
  do {
    // 随机生成一个索引值
    randomIndex = Math.floor(Math.random() * postData.length);
  } while (randomIndex === lastIndex && postData.length > 1);
  // 更新上一次的索引值
  lastIndex = randomIndex;
  // 随机文章
  const randomPost = postData[randomIndex];
  // 跳转到随机文章
  return randomPost.regularPath;
};

/**
 * 获取根据当前时间的问候语
 * @returns {string} 当前时间对应的问候语
 */
export const getGreetings = () => {
  const hour = new Date().getHours();
  let hello;
  if (hour < 6) {
    hello = "凌晨好，昨晚睡得怎么样？";
  } else if (hour < 9) {
    hello = "早上好，今天也要开心哦！";
  } else if (hour < 12) {
    hello = "上午好，今天也要加油哦！";
  } else if (hour < 14) {
    hello = "中午好，吃饱了精神好！";
  } else if (hour < 17) {
    hello = "下午好，继续加油！";
  } else if (hour < 19) {
    hello = "傍晚好，是时候放松一下了！";
  } else if (hour < 22) {
    hello = "晚上好，是时候休息了！";
  } else {
    hello = "夜深了，明天继续加油！";
  }
  return hello;
};
