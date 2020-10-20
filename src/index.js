import '@babel/register';
import React from './react';
import ReactDOM from './reactDom';

const test = 123;
const element = <div>
  hello
  <span>
    world!
    {test}
  </span>

  <p>
    {null}
  </p>
</div>;

ReactDOM.render(element, document.getElementById('app'));
