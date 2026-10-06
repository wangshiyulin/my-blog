/**
 * 从文件名生成数字 ID
 * @param {string} fileName - 文件名
 * @returns {number} - 生成的数字ID
 */
export const generateId = (fileName) => {
  // 将文件名转换为哈希值
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
  }
  // 将哈希值转换为正整数
  const numericId = Math.abs(hash % 10000000000);
  return numericId;
};

const scriptPromises = new Map();
const stylePromises = new Map();

const findScript = (src) => {
  if (typeof document === "undefined") return null;
  const absoluteSrc = new URL(src, document.baseURI).href;
  return [...document.scripts].find((script) => script.src === absoluteSrc) || null;
};

const findStyle = (href) => {
  if (typeof document === "undefined") return null;
  const absoluteHref = new URL(href, document.baseURI).href;
  return (
    [...document.querySelectorAll('link[rel="stylesheet"]')].find(
      (link) => link.href === absoluteHref,
    ) || null
  );
};

/**
 * 动态加载脚本。
 * 同一 URL 的并发加载会共享同一个 Promise，避免 SPA 中重复插入脚本造成竞态。
 * @param {string} src - 脚本 URL
 * @param {object} option - 配置
 * @returns {Promise<HTMLScriptElement>|false}
 */
export const loadScript = (src, option = {}) => {
  if (typeof document === "undefined" || !src) return false;

  const { async = false, reload = false, callback } = option;
  const absoluteSrc = new URL(src, document.baseURI).href;

  if (!reload) {
    const pending = scriptPromises.get(absoluteSrc);
    if (pending) {
      return pending.then(
        (script) => {
          callback?.(null, script);
          return script;
        },
        (error) => {
          callback?.(error);
          throw error;
        },
      );
    }

    const existingScript = findScript(src);
    if (existingScript) {
      const promise = Promise.resolve(existingScript);
      callback?.(null, existingScript);
      return promise;
    }
  } else {
    scriptPromises.delete(absoluteSrc);
    findScript(src)?.remove();
  }

  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  scriptPromises.set(absoluteSrc, promise);

  const script = document.createElement("script");
  script.src = absoluteSrc;
  script.async = async;
  script.onload = () => {
    script.dataset.loaded = "true";
    resolvePromise(script);
  };
  script.onerror = (error) => {
    script.remove();
    scriptPromises.delete(absoluteSrc);
    rejectPromise(error);
  };
  document.head.appendChild(script);

  return promise.then(
    (loadedScript) => {
      callback?.(null, loadedScript);
      return loadedScript;
    },
    (error) => {
      callback?.(error);
      throw error;
    },
  );
};

/**
 * 动态加载样式表。
 * 同一 URL 的并发加载会共享同一个 Promise。
 * @param {string} href - 样式表 URL
 * @param {object} option - 配置
 * @returns {Promise<HTMLLinkElement>|false}
 */
export const loadCSS = (href, option = {}) => {
  if (typeof document === "undefined" || !href) return false;

  const { reload = false, callback } = option;
  const absoluteHref = new URL(href, document.baseURI).href;

  if (!reload) {
    const pending = stylePromises.get(absoluteHref);
    if (pending) {
      return pending.then(
        (link) => {
          callback?.(null, link);
          return link;
        },
        (error) => {
          callback?.(error);
          throw error;
        },
      );
    }

    const existingLink = findStyle(href);
    if (existingLink) {
      const promise = Promise.resolve(existingLink);
      callback?.(null, existingLink);
      return promise;
    }
  } else {
    stylePromises.delete(absoluteHref);
    findStyle(href)?.remove();
  }

  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  stylePromises.set(absoluteHref, promise);

  const link = document.createElement("link");
  link.href = absoluteHref;
  link.rel = "stylesheet";
  link.type = "text/css";
  link.onload = () => {
    link.dataset.loaded = "true";
    resolvePromise(link);
  };
  link.onerror = (error) => {
    link.remove();
    stylePromises.delete(absoluteHref);
    rejectPromise(error);
  };
  document.head.appendChild(link);

  return promise.then(
    (loadedLink) => {
      callback?.(null, loadedLink);
      return loadedLink;
    },
    (error) => {
      callback?.(error);
      throw error;
    },
  );
};
