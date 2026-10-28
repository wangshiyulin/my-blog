// Full Unicode coverage loads without blocking first paint. Common glyphs are already inline.
(() => {
  const stylesheet = document.getElementById("site-full-font");
  if (!stylesheet) return;
  const enable = () => {
    stylesheet.media = "all";
  };
  if (stylesheet.sheet) enable();
  else stylesheet.addEventListener("load", enable, { once: true });
})();
