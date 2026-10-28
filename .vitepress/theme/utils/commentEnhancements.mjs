// Twikoo 的操作按钮仍需执行自身点击处理，但不能导航到空锚点。
export const preventCommentActionNavigation = (event) => {
  const action = event.target.closest?.('a.tk-action-link[href="#"]');
  if (action && event.currentTarget.contains(action)) event.preventDefault();
};

export const observeBloggerAvatars = (container) => {
  const avatarUrl = "/images/logo/logo-100.webp";
  const update = () => {
    // 使用直接子节点，避免把博主评论下面的访客回复头像一并替换。
    for (const avatar of container.querySelectorAll(".tk-comment.tk-master > .tk-avatar")) {
      let image = avatar.querySelector(":scope > .tk-avatar-img");
      if (image?.tagName !== "IMG") {
        const replacement = container.ownerDocument.createElement("img");
        replacement.className = "tk-avatar-img";
        replacement.alt = "博主头像";
        replacement.src = avatarUrl;
        if (image) image.replaceWith(replacement);
        else avatar.append(replacement);
        image = replacement;
      }
      if (image.getAttribute("src") !== avatarUrl) image.setAttribute("src", avatarUrl);
      if (!avatar.classList.contains("tk-has-avatar")) avatar.classList.add("tk-has-avatar");
    }
  };
  const observer = new window.MutationObserver(update);
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class"] });
  update();
  return () => observer.disconnect();
};
