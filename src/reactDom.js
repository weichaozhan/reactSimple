function setAttributes(dom, attrName, attrValue) {
  let name = attrName;
  
  if (attrName === 'className') {
    name = 'class';
  } else if (/on\w+/.test(name)) {
    name = attrName.toLowerCase();
    dom[name] = attrValue ?? '';
  } else if (name === 'style') {
    if (!attrValue || typeof attrValue === 'string') {
      dom.style.cssText = attrValue ?? '';
    } else if (attrValue && Object.prototype.toString.call(attrValue) === '[object Object]') {
      for (let key in attrValue) {
        const value = attrValue[key];
        dom.style[key] = typeof value === 'number' ? `${value}px` : value;
      }
    }
  } else {
    if (name in dom) {
      dom[name] = attrValue ?? '';
    }
    if (attrValue) {
      dom.setAttribute(name, attrValue);
    } else {
      dom.removeAttribute(name);
    }
  }
}

function render(vnode, container) {
  if (typeof vnode !== 'object' || vnode === null) {
    const textNode = document.createTextNode(vnode);
    container.appendChild(textNode);
    return textNode;
  }

  const dom = document.createElement(vnode?.tag);
  
  if (vnode?.attrs) {
    Object.keys(vnode.attrs).forEach(key => {
      const value = vnode?.attrs?.[key];
      setAttributes(dom, key, value);
    });
  }

  vnode?.children?.forEach(child => {
    render(child, dom);
  });

  container.appendChild(dom);
  return container;
}

export default {
  render: (vnode, container) => {
    container.innerHTML = '';
    
    return render(vnode, container);
  }
};
