import { setAttributes } from './reactDom';

export const diff = (dom, vnode) => {
  let out;

  if (typeof vnode === 'string') {
    if (dom?.nodeType === 3) {
      dom?.textContent !== vnode && (dom.textContent = vnode);
    } else {
      out = document.createTextNode(vnode);

      dom?.parentNode?.replaceChild(out, dom);
    }
    return out;
  }

  if (!dom || dom?.nodeName.toLowerCase() === vnode.tag.toLowerCase()) {
    out = document.createElement(vnode.tag);

    [...(dom?.childNodes ?? [])].map(out?.appendChild ?? (() => {}));

    dom?.parentNode?.replaceChild(out, dom);
  }
};

export const diffAttributes = (dom, vnode) => {
  const old = {};
  const attrs = vnode.attrs;

  if (dom) {
    for (let attr of dom.attributes) {
      old[attr.name] = attr.value;
    }

    for (let name in old) {
      if (!(name in attrs)) {
        setAttributes(dom, name, undefined);
      }
    }

    for (let name in attrs) {
      if (old[name] !== attrs[name]) {
        setAttributes(dom, name, attrs[name]);
      }
    }
  }
};
