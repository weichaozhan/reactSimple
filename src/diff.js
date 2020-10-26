import { setAttributes, setComponentProps, createComponent } from './reactDom';

export const unmountComponent = (component) => {
  if (component.componentWillUnmount) component.componentWillUnmount();
  removeNode(component.base);
}

export const removeNode = (dom) => {
  if (dom?.parentNode) {
    dom.parentNode.removeChild(dom);
  }
}

export const isSameNodeType = (dom, vnode) => {
  if (['string', 'number', 'boolean', 'undefined'].includes(typeof vnode) || vnode === null) {
    return dom?.nodeType === 3;
  }

  if (typeof vnode.tag === 'string') {
    return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
  }

  return dom?._component?.constructor === vnode.tag;
}

export function diff(dom, vnode, container) {
  const ret = diffNode(dom, vnode);

  if ( container && ret.parentNode !== container ) {
    container.appendChild( ret );
  }

  return ret;
};

export function diffChildren(dom, vchildren) {
  const domChildren = dom?.childNodes;
  const children = [];

  const keyed = {};
  
  // Separate child with key and without key
  if (domChildren?.length > 0) {
    domChildren.forEach(child => {
      const key = child.key;
      
      if (key) {
        keyed[key] = child;
      } else {
        children.push(child);
      }
    });
  }

  if (vchildren?.length > 0) {
    let min = 0;
    let childrenLen = children.length;

    vchildren.forEach((vchild, i) => {
      const key = vchild.key;
      let child;

      if (key) {
        if (keyed[key]) {
          child = keyed[key];
          keyed[key] = undefined;
        }
      } else if (min < childrenLen) {
        for (let index = min; min < childrenLen; index++) {
          const currentChild = children[index];

          if (currentChild && isSameNodeType(currentChild, vchild)) {
            child = currentChild;
            children[index] = undefined;

            if (index === childrenLen - 1) childrenLen--;
            if (index === min) min++;
            break;
          }
        }
      }

      child = diffNode(child, vchild);
      const f = domChildren?.[i];
      if (child && child !== dom && child !== f) {
          // 如果更新前的对应位置为空，说明此节点是新增的
          if (!f) {
            dom?.appendChild?.(child);
          // 如果更新后的节点和更新前对应位置的下一个节点一样，说明当前位置的节点被移除了
          } else if (child === f.nextSibling ) {
            removeNode(f);
          // 将更新后的节点移动到正确的位置
          } else {
            // 注意insertBefore的用法，第一个参数是要插入的节点，第二个参数是已存在的节点
            dom.insertBefore(child, f);
          }
      }
    });
  }
}

function diffNode( dom, vnode ) {
  let out = dom;

  if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

  if ( typeof vnode === 'number' ) vnode = String( vnode );

  // diff text node
  if ( typeof vnode === 'string' ) {
    // 如果当前的DOM就是文本节点，则直接更新内容
    if ( dom && dom.nodeType === 3 ) {    // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
      if ( dom.textContent !== vnode ) {
        dom.textContent = vnode;
      }
    // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
    } else {
      out = document.createTextNode( vnode );
      if ( dom && dom.parentNode ) {
        dom.parentNode.replaceChild( out, dom );
      }
    }

    return out;
  }

  if ( typeof vnode.tag === 'function' ) {
    return diffComponent( dom, vnode );
  }

  //
  if ( !dom || !isSameNodeType( dom, vnode ) ) {
    out = document.createElement( vnode.tag );

    if ( dom ) {
      [ ...dom.childNodes ].map( out.appendChild );    // 将原来的子节点移到新节点下

      if ( dom.parentNode ) {
        dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
      }
    }
  }

  if ( vnode.children && vnode.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
    diffChildren( out, vnode.children );
  }

  diffAttributes( out, vnode );

  return out;

}

export const diffComponent = (dom, vnode) => {
  let domHandle = dom;
  let c = dom?._component;
  let oldDom = dom;

  if (c?.constructor === vnode.tag) {
    setComponentProps(c, vnode?.attrs);
    domHandle = c.base;
  } else {
    if (c) {
      unmountComponent(c);
      oldDom = null;
    }

    c = createComponent( vnode.tag, vnode.attrs );

    setComponentProps( c, vnode.attrs );
    domHandle = c.base;

    if ( oldDom && domHandle !== oldDom ) {
      oldDom._component = null;
      removeNode( oldDom );
    }
  }

  return domHandle;
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
