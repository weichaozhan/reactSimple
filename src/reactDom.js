import { Component } from './react';

export function setAttributes(dom, attrName, attrValue) {
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

function createComponent(cmfunc, props) {
  let inst;

  if (cmfunc.prototype?.render) {
    inst = new cmfunc(props);
  } else {
    inst = new Component(props);
    // inst.constructor = cmfunc;
    inst.render = function() {
      // return this.constructor(props);
      return cmfunc(props);
    };
  }

  return inst;
}

export function setComponentProps(component, props) {
  if (!component.base) {
    component.componentWillMount?.();
  } else {
    component.componentWillReceiveProps(props);
  }

  component.props = props;

  renderComponent(component);
}

export function renderComponent(component) {
  let base;
  const renderer = component.render();

  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

  base = _render(renderer);

  if (!component.base) {
    component.componentDidMount?.();
  } else {
    component.componentDidUpdate?.();
  }

  component?.base?.parentNode?.replaceChild?.(base, component.base)

  component.base = base;
  base._component = component;
}

function _render(vnode) {
  if (typeof vnode !== 'object' || vnode === null) {
    const textNode = document.createTextNode(vnode);
    return textNode;
  }

  if (typeof vnode.tag === 'function') {
    const component = createComponent(vnode.tag, vnode.attrs);

    setComponentProps(component, vnode.attrs);

    return component.base;
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
  
  return dom;
}

const render = (vnode, container) => {
  const dom = _render(vnode);
  
  return container.appendChild(dom);
}

export default {
  render: (vnode, container) => {
    container.innerHTML = '';

    return render(vnode, container);
  }
};
