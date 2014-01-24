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
 * @emails react-core
 * @jsx React.DOM
 */

"use strict";

require("../../mock-modules").dontMock('cloneWithProps');

var mocks = require("../../mocks");

var cloneWithProps = require("../../cloneWithProps");

var React;
var ReactTestUtils;

var onlyChild;

describe('cloneWithProps', function() {

  beforeEach(function() {
    React = require("../../React");
    ReactTestUtils = require("../../ReactTestUtils");
    onlyChild = require("../../onlyChild");
  });

  it('should clone a DOM component with new props', function() {
    var Grandparent = React.createClass({displayName: 'Grandparent',
      render: function() {
        return Parent(null, React.DOM.div( {className:"child"} ));
      }
    });
    var Parent = React.createClass({displayName: 'Parent',
      render: function() {
        return (
          React.DOM.div( {className:"parent"}, 
            cloneWithProps(onlyChild(this.props.children), {className: 'xyz'})
          )
        );
      }
    });
    var component = ReactTestUtils.renderIntoDocument(Grandparent(null ));
    expect(component.getDOMNode().childNodes[0].className)
      .toBe('child xyz');
  });

  it('should clone a composite component with new props', function() {

    var Child = React.createClass({displayName: 'Child',
      render: function() {
        return React.DOM.div( {className:this.props.className} );
      }
    });

    var Grandparent = React.createClass({displayName: 'Grandparent',
      render: function() {
        return Parent(null, Child( {className:"child"} ));
      }
    });
    var Parent = React.createClass({displayName: 'Parent',
      render: function() {
        return (
          React.DOM.div( {className:"parent"}, 
            cloneWithProps(onlyChild(this.props.children), {className: 'xyz'})
          )
        );
      }
    });
    var component = ReactTestUtils.renderIntoDocument(Grandparent(null ));
    expect(component.getDOMNode().childNodes[0].className)
      .toBe('child xyz');
  });

  it('should warn when cloning with refs', function() {
    var Grandparent = React.createClass({displayName: 'Grandparent',
      render: function() {
        return Parent(null, React.DOM.div( {ref:"yolo"} ));
      }
    });
    var Parent = React.createClass({displayName: 'Parent',
      render: function() {
        return (
          React.DOM.div(null, 
            cloneWithProps(onlyChild(this.props.children), {className: 'xyz'})
          )
        );
      }
    });

    var _warn = console.warn;

    try {
      console.warn = mocks.getMockFunction();

      var component = ReactTestUtils.renderIntoDocument(Grandparent(null ));
      expect(component.refs).toBe(undefined);
      expect(console.warn.mock.calls.length).toBe(1);
    } finally {
      console.warn = _warn;
    }
  });

  it('should transfer the key property', function() {
    var Component = React.createClass({displayName: 'Component',
      render: function() {
        expect(this.props.key).toBe('xyz');
        return React.DOM.div(null );
      }
    });

    ReactTestUtils.renderIntoDocument(
      cloneWithProps(Component(null ), {key: 'xyz'})
    );
  });
});

require("../../mock-modules").register("utils/__tests__/cloneWithProps-test", module);
