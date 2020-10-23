import '@babel/register';
import React from './react';
import ReactDOM from './reactDom';

import Counter from './Counter';

const Test = () => {
  return <div>
    function
  </div>;
};

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

  <Test/>

  <Counter/>
</div>;

ReactDOM.render(element, document.getElementById('app'));
