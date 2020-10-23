import { renderComponent } from './reactDom';

export function createElement(tag, attrs, ...children) {
  return {
    tag,
    attrs,
    children
  };
}

export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
  }

  setState(stateChange = {}) {
    this.state = Object.assign(this.state, stateChange);
    renderComponent(this);
  }
}

export default {
  createElement,
  Component
};
