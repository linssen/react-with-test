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
var ReactUpdates;

describe('ReactUpdates', function() {
  beforeEach(function() {
    React = require("../../React");
    ReactTestUtils = require("../../ReactTestUtils");
    ReactUpdates = require("../../ReactUpdates");
  });

  it('should batch state when updating state twice', function() {
    var updateCount = 0;
    var Component = React.createClass({displayName: 'Component',
      getInitialState: function() {
        return {x: 0};
      },
      componentDidUpdate: function() {
        updateCount++;
      },
      render: function() {
        return React.DOM.div(null, this.state.x);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Component(null ));
    expect(instance.state.x).toBe(0);

    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1});
      instance.setState({x: 2});
      expect(instance.state.x).toBe(0);
      expect(updateCount).toBe(0);
    });

    expect(instance.state.x).toBe(2);
    expect(updateCount).toBe(1);
  });

  it('should batch state when updating two different state keys', function() {
    var updateCount = 0;
    var Component = React.createClass({displayName: 'Component',
      getInitialState: function() {
        return {x: 0, y: 0};
      },
      componentDidUpdate: function() {
        updateCount++;
      },
      render: function() {
        return React.DOM.div(null, "(",this.state.x,", ", this.state.y,")");
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Component(null ));
    expect(instance.state.x).toBe(0);
    expect(instance.state.y).toBe(0);

    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1});
      instance.setState({y: 2});
      expect(instance.state.x).toBe(0);
      expect(instance.state.y).toBe(0);
      expect(updateCount).toBe(0);
    });

    expect(instance.state.x).toBe(1);
    expect(instance.state.y).toBe(2);
    expect(updateCount).toBe(1);
  });

  it('should batch state and props together', function() {
    var updateCount = 0;
    var Component = React.createClass({displayName: 'Component',
      getInitialState: function() {
        return {y: 0};
      },
      componentDidUpdate: function() {
        updateCount++;
      },
      render: function() {
        return React.DOM.div(null, "(",this.props.x,", ", this.state.y,")");
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Component( {x:0} ));
    expect(instance.props.x).toBe(0);
    expect(instance.state.y).toBe(0);

    ReactUpdates.batchedUpdates(function() {
      instance.setProps({x: 1});
      instance.setState({y: 2});
      expect(instance.props.x).toBe(0);
      expect(instance.state.y).toBe(0);
      expect(updateCount).toBe(0);
    });

    expect(instance.props.x).toBe(1);
    expect(instance.state.y).toBe(2);
    expect(updateCount).toBe(1);
  });

  it('should batch parent/child state updates together', function() {
    var parentUpdateCount = 0;
    var Parent = React.createClass({displayName: 'Parent',
      getInitialState: function() {
        return {x: 0};
      },
      componentDidUpdate: function() {
        parentUpdateCount++;
      },
      render: function() {
        return React.DOM.div(null, Child( {ref:"child", x:this.state.x} ));
      }
    });
    var childUpdateCount = 0;
    var Child = React.createClass({displayName: 'Child',
      getInitialState: function() {
        return {y: 0};
      },
      componentDidUpdate: function() {
        childUpdateCount++;
      },
      render: function() {
        return React.DOM.div(null, this.props.x + this.state.y);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Parent(null ));
    var child = instance.refs.child;
    expect(instance.state.x).toBe(0);
    expect(child.state.y).toBe(0);

    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1});
      child.setState({y: 2});
      expect(instance.state.x).toBe(0);
      expect(child.state.y).toBe(0);
      expect(parentUpdateCount).toBe(0);
      expect(childUpdateCount).toBe(0);
    });

    expect(instance.state.x).toBe(1);
    expect(child.state.y).toBe(2);
    expect(parentUpdateCount).toBe(1);
    expect(childUpdateCount).toBe(1);
  });

  it('should batch child/parent state updates together', function() {
    var parentUpdateCount = 0;
    var Parent = React.createClass({displayName: 'Parent',
      getInitialState: function() {
        return {x: 0};
      },
      componentDidUpdate: function() {
        parentUpdateCount++;
      },
      render: function() {
        return React.DOM.div(null, Child( {ref:"child", x:this.state.x} ));
      }
    });
    var childUpdateCount = 0;
    var Child = React.createClass({displayName: 'Child',
      getInitialState: function() {
        return {y: 0};
      },
      componentDidUpdate: function() {
        childUpdateCount++;
      },
      render: function() {
        return React.DOM.div(null, this.props.x + this.state.y);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Parent(null ));
    var child = instance.refs.child;
    expect(instance.state.x).toBe(0);
    expect(child.state.y).toBe(0);

    ReactUpdates.batchedUpdates(function() {
      child.setState({y: 2});
      instance.setState({x: 1});
      expect(instance.state.x).toBe(0);
      expect(child.state.y).toBe(0);
      expect(parentUpdateCount).toBe(0);
      expect(childUpdateCount).toBe(0);
    });

    expect(instance.state.x).toBe(1);
    expect(child.state.y).toBe(2);
    expect(parentUpdateCount).toBe(1);

    // Batching reduces the number of updates here to 1.
    expect(childUpdateCount).toBe(1);
  });

  it('should support chained state updates', function() {
    var updateCount = 0;
    var Component = React.createClass({displayName: 'Component',
      getInitialState: function() {
        return {x: 0};
      },
      componentDidUpdate: function() {
        updateCount++;
      },
      render: function() {
        return React.DOM.div(null, this.state.x);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Component(null ));
    expect(instance.state.x).toBe(0);

    var innerCallbackRun = false;
    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1}, function() {
        instance.setState({x: 2}, function() {
          expect(this).toBe(instance);
          innerCallbackRun = true;
          expect(instance.state.x).toBe(2);
          expect(updateCount).toBe(2);
        });
        expect(instance.state.x).toBe(1);
        expect(updateCount).toBe(1);
      });
      expect(instance.state.x).toBe(0);
      expect(updateCount).toBe(0);
    });

    expect(innerCallbackRun).toBeTruthy();
    expect(instance.state.x).toBe(2);
    expect(updateCount).toBe(2);
  });

  it('should batch forceUpdate together', function() {
    var shouldUpdateCount = 0;
    var updateCount = 0;
    var Component = React.createClass({displayName: 'Component',
      getInitialState: function() {
        return {x: 0};
      },
      shouldComponentUpdate: function() {
        shouldUpdateCount++;
      },
      componentDidUpdate: function() {
        updateCount++;
      },
      render: function() {
        return React.DOM.div(null, this.state.x);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(Component(null ));
    expect(instance.state.x).toBe(0);

    var callbacksRun = 0;
    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1}, function() {
        callbacksRun++;
      });
      instance.forceUpdate(function() {
        callbacksRun++;
      });
      expect(instance.state.x).toBe(0);
      expect(updateCount).toBe(0);
    });

    expect(callbacksRun).toBe(2);
    // shouldComponentUpdate shouldn't be called since we're forcing
    expect(shouldUpdateCount).toBe(0);
    expect(instance.state.x).toBe(1);
    expect(updateCount).toBe(1);
  });

  it('should update children even if parent blocks updates', function() {
    var parentRenderCount = 0;
    var childRenderCount = 0;

    var Parent = React.createClass({displayName: 'Parent',
      shouldComponentUpdate: function() {
        return false;
      },

      render: function() {
        parentRenderCount++;
        return Child( {ref:"child"} );
      }
    });

    var Child = React.createClass({displayName: 'Child',
      render: function() {
        childRenderCount++;
        return React.DOM.div(null );
      }
    });

    expect(parentRenderCount).toBe(0);
    expect(childRenderCount).toBe(0);

    var instance = Parent(null );
    ReactTestUtils.renderIntoDocument(instance);

    expect(parentRenderCount).toBe(1);
    expect(childRenderCount).toBe(1);

    ReactUpdates.batchedUpdates(function() {
      instance.setState({x: 1});
    });

    expect(parentRenderCount).toBe(1);
    expect(childRenderCount).toBe(1);

    ReactUpdates.batchedUpdates(function() {
      instance.refs.child.setState({x: 1});
    });

    expect(parentRenderCount).toBe(1);
    expect(childRenderCount).toBe(2);
  });

  it('should not reconcile children passed via props', function() {
    var numMiddleRenders = 0;
    var numBottomRenders = 0;

    var Top = React.createClass({displayName: 'Top',
      render: function() {
        return Middle(null, Bottom(null ));
      }
    });

    var Middle = React.createClass({displayName: 'Middle',
      componentDidMount: function() {
        this.forceUpdate();
      },

      render: function() {
        numMiddleRenders++;
        return React.DOM.div(null, this.props.children);
      }
    });

    var Bottom = React.createClass({displayName: 'Bottom',
      render: function() {
        numBottomRenders++;
        return React.DOM.span(null );
      }
    });

    ReactTestUtils.renderIntoDocument(Top(null ));
    expect(numMiddleRenders).toBe(2);
    expect(numBottomRenders).toBe(1);
  });

  it('should flow updates correctly', function() {
    var willUpdates = [];
    var didUpdates = [];

    var UpdateLoggingMixin = {
      componentWillUpdate: function() {
        willUpdates.push(this.constructor.displayName);
      },
      componentDidUpdate: function() {
        didUpdates.push(this.constructor.displayName);
      }
    };

    var Box = React.createClass({displayName: 'Box',
      mixins: [UpdateLoggingMixin],

      render: function() {
        return React.DOM.div( {ref:"boxDiv"}, this.props.children);
      }
    });

    var Child = React.createClass({displayName: 'Child',
      mixins: [UpdateLoggingMixin],

      render: function() {
        return React.DOM.span( {ref:"span"}, "child");
      }
    });

    var Switcher = React.createClass({displayName: 'Switcher',
      mixins: [UpdateLoggingMixin],

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
      mixins: [UpdateLoggingMixin],

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

    function expectUpdates(desiredWillUpdates, desiredDidUpdates) {
      expect(willUpdates).toEqual(desiredWillUpdates);
      expect(didUpdates).toEqual(desiredDidUpdates);
      willUpdates.length = 0;
      didUpdates.length = 0;
    }

    function triggerUpdate(c) {
      c.setState({x: 1});
    }

    function testUpdates(components, desiredWillUpdates, desiredDidUpdates) {
      var i;

      ReactUpdates.batchedUpdates(function() {
        for (i = 0; i < components.length; i++) {
          triggerUpdate(components[i]);
        }
      });

      expectUpdates(desiredWillUpdates, desiredDidUpdates);

      // Try them in reverse order

      ReactUpdates.batchedUpdates(function() {
        for (i = components.length - 1; i >= 0; i--) {
          triggerUpdate(components[i]);
        }
      });

      expectUpdates(desiredWillUpdates, desiredDidUpdates);
    }

    testUpdates(
      [root.refs.switcher.refs.box, root.refs.switcher],
      // Owner-child relationships have inverse will and did
      ['Switcher', 'Box'],
      ['Box', 'Switcher']
    );

    testUpdates(
      [root.refs.child, root.refs.switcher.refs.box],
      // Not owner-child so reconcile independently
      ['Box', 'Child'],
      ['Box', 'Child']
    );

    testUpdates(
      [root.refs.child, root.refs.switcher],
      // Switcher owns Box and Child, Box does not own Child
      ['Switcher', 'Box', 'Child'],
      ['Box', 'Switcher', 'Child']
    );
  });
});

require("../../mock-modules").register("core/__tests__/ReactUpdates-test", module);
