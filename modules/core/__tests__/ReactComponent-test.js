/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @jsx React.DOM
 * @emails react-core
 */

"use strict";

var React;
var ReactTestUtils;

var reactComponentExpect;

describe('ReactComponent', function() {
  beforeEach(function() {
    React = require("../../React");
    ReactTestUtils = require("../../ReactTestUtils");
    reactComponentExpect = require("../../reactComponentExpect");
  });

  it('should throw on invalid render targets', function() {
    var container = document.createElement('div');
    // jQuery objects are basically arrays; people often pass them in by mistake
    expect(function() {
      React.renderComponent(React.DOM.div(null), [container]);
    }).toThrow(
      'Invariant Violation: _registerComponent(...): Target container ' +
      'is not a DOM element.'
    );

    expect(function() {
      React.renderComponent(React.DOM.div(null), null);
    }).toThrow(
      'Invariant Violation: _registerComponent(...): Target container ' +
      'is not a DOM element.'
    );
  });

  it('should throw when supplying a ref outside of render method', function() {
    var instance = React.DOM.div( {ref:"badDiv"} );
    expect(function() {
      ReactTestUtils.renderIntoDocument(instance);
    }).toThrow();
  });

  it('should throw when attempting to hijack a ref', function() {
    var Component = React.createClass({displayName: 'Component',
      render: function() {
        var child = this.props.child;
        this.attachRef('test', child);
        return child;
      }
    });

    var instance = Component( {child:React.DOM.span(null )} );

    expect(function() {
      ReactTestUtils.renderIntoDocument(instance);
    }).toThrow(
      'Invariant Violation: attachRef(test, ...): Only a component\'s owner ' +
      'can store a ref to it.'
    );
  });

  it('should support refs on owned components', function() {
    var inner, outer;

    var Component = React.createClass({displayName: 'Component',
      render: function() {
        inner = React.DOM.div( {ref:"inner"} );
        outer = React.DOM.div( {ref:"outer"}, inner);
        return outer;
      },
      componentDidMount: function() {
        expect(this.refs.inner).toEqual(inner);
        expect(this.refs.outer).toEqual(outer);
      }
    });

    var instance = Component( {child:React.DOM.span(null )} );
    ReactTestUtils.renderIntoDocument(instance);
  });

  it('should not have refs on unmounted components', function() {
    var Parent = React.createClass({displayName: 'Parent',
      render: function() {
        return Child(null, React.DOM.div( {ref:"test"} ));
      },
      componentDidMount: function() {
        expect(this.refs && this.refs.test).toEqual(undefined);
      }
    });
    var Child = React.createClass({displayName: 'Child',
      render: function() {
        return React.DOM.div(null );
      }
    });

    var instance = Parent( {child:React.DOM.span(null )} );
    ReactTestUtils.renderIntoDocument(instance);
  });

  it('should correctly determine if a component is mounted', function() {
    var Component = React.createClass({displayName: 'Component',
      componentWillMount: function() {
        expect(this.isMounted()).toBeFalsy();
      },
      componentDidMount: function() {
        expect(this.isMounted()).toBeTruthy();
      },
      render: function() {
        return React.DOM.div(null);
      }
    });

    var instance = Component(null );

    expect(instance.isMounted()).toBeFalsy();
    ReactTestUtils.renderIntoDocument(instance);
    expect(instance.isMounted()).toBeTruthy();
  });

  it('should know its simple mount depth', function() {
    var Owner = React.createClass({displayName: 'Owner',
      render: function() {
        return Child( {ref:"child"} );
      }
    });

    var Child = React.createClass({displayName: 'Child',
      render: function() {
        return React.DOM.div(null );
      }
    });

    var instance = Owner(null );
    ReactTestUtils.renderIntoDocument(instance);
    expect(instance._mountDepth).toBe(0);
    expect(instance.refs.child._mountDepth).toBe(1);
  });

  it('should know its (complicated) mount depth', function() {
    var Box = React.createClass({displayName: 'Box',
      render: function() {
        return React.DOM.div( {ref:"boxDiv"}, this.props.children);
      }
    });

    var Child = React.createClass({displayName: 'Child',
      render: function() {
        return React.DOM.span( {ref:"span"}, "child");
      }
    });

    var Switcher = React.createClass({displayName: 'Switcher',
      getInitialState: function() {
        return {tabKey: 'hello'};
      },

      render: function() {
        var child = this.props.children;

        return (
          Box( {ref:"box"}, 
            React.DOM.div(
              {ref:"switcherDiv",
              style:{
                display: this.state.tabKey === child.key ? '' : 'none'
            }}, 
              child
            )
          )
        );
      }
    });

    var App = React.createClass({displayName: 'App',
      render: function() {
        return (
          Switcher( {ref:"switcher"}, 
            Child( {key:"hello", ref:"child"} )
          )
        );
      }
    });

    var root = App(null );
    ReactTestUtils.renderIntoDocument(root);

    expect(root._mountDepth).toBe(0);
    expect(root.refs.switcher._mountDepth).toBe(1);
    expect(root.refs.switcher.refs.box._mountDepth).toBe(2);
    expect(root.refs.switcher.refs.switcherDiv._mountDepth).toBe(4);
    expect(root.refs.child._mountDepth).toBe(5);
    expect(root.refs.switcher.refs.box.refs.boxDiv._mountDepth).toBe(3);
    expect(root.refs.child.refs.span._mountDepth).toBe(6);
  });
});

require("../../mock-modules").register("core/__tests__/ReactComponent-test", module);
