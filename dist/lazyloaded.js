/* lazyloaded v1.0.1 | https://github.com/stamat/lazyloaded | MIT License */
(() => {
  // node_modules/book-of-spells/src/helpers.mjs
  function isFunction(o) {
    return typeof o === "function";
  }
  function closestNumber(goal, arr) {
    return arr.reduce(function(prev, curr) {
      return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
    });
  }

  // node_modules/book-of-spells/src/dom.mjs
  function loadImage(src, callback) {
    const img = new Image();
    if (callback)
      img.addEventListener("load", callback, false);
    img.src = src;
  }

  // lazyloaded.mjs
  var LazyLoaded = class {
    constructor(selector = ".js-lazyloaded", callback = null, options = {}) {
      this.selector = selector;
      this.px_ratio = window.hasOwnProperty("devicePixelRatio") ? window.devicePixelRatio : 1;
      this.callback = callback;
      this.observer = null;
      this.options = options || {};
      return this.init(this.selector);
    }
    parseSrcset(srcset) {
      let type = null;
      const map = {};
      const sizes = [];
      for (const line of srcset.split(",")) {
        const trimmedLine = line.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
        const pts = trimmedLine.split(/[\s\uFEFF\xA0]+/g);
        if (!pts.length > 1)
          continue;
        if (/x$/i.test(pts[1])) {
          type = "ratio";
          pts[1] = parseFloat(pts[1].replace(/x$/i, ""));
        } else {
          type = "size";
          pts[1] = parseInt(pts[1].replace(/px$|vw$|w$/i, ""), 10);
        }
        if (!Number.isNaN(pts[1])) {
          sizes.push(pts[1]);
          map[pts[1]] = pts[0];
        }
      }
      return {
        type,
        srcset: map,
        sizes
      };
    }
    loadImage(elem) {
      let src = elem.getAttribute("data-src");
      const srcset = elem.getAttribute("data-srcset");
      if (srcset) {
        const data = this.parseSrcset(srcset);
        const selected = this.closest(data.sizes, data.type);
        src = data.srcset[selected];
      }
      if (!src || !src.length)
        return;
      loadImage(src, () => {
        const bg = elem.getAttribute("data-background");
        if (bg && (bg === "" || bg === "true")) {
          elem.style.backgroundImage = `url(${src})`;
        } else {
          elem.src = src;
        }
        if (isFunction(this.callback))
          this.callback(elem);
        elem.classList.add(`${this.selector.replace(/^\.(js\-)?/, "")}--loaded`);
      });
    }
    loadAll(elements) {
      if (!elements || !elements.length)
        return;
      for (const element of elements) {
        this.loadImage(element);
        if (this.observer)
          this.observer.unobserve(element);
      }
    }
    observe(entries, observer) {
      for (const entry of entries) {
        if (!entry.isIntersecting)
          continue;
        const elem = entry.target;
        this.loadImage(elem);
        this.observer.unobserve(elem);
      }
    }
    init(selector) {
      const elements = document.querySelectorAll(selector);
      if (!elements || !elements.length)
        return;
      if (!window.hasOwnProperty("IntersectionObserver"))
        return this.loadAll(elements);
      this.observer = this.observer || new IntersectionObserver(this.observe.bind(this), this.options);
      for (const element of elements) {
        this.observer.observe(element);
      }
    }
    add(elements) {
      if (!elements.hasOwnProperty("length"))
        elements = [elements];
      if (!this.observer)
        return this.loadAll(elements);
      for (const element of elements) {
        this.observer.observe(element);
      }
    }
    closest(sizes, type) {
      let goal = type !== "ratio" ? window.innerWidth * this.px_ratio : this.px_ratio;
      return closestNumber(goal, sizes);
    }
  };
  var lazyloaded_default = LazyLoaded;

  // build/iife.js
  if (!window.LazyLoaded) {
    window.LazyLoaded = lazyloaded_default;
  }
})();
//# sourceMappingURL=lazyloaded.js.map
