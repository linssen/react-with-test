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

var mocks = require("../../mocks");

describe('ReactMultiChild', function() {
  var React;

  beforeEach(function() {
    require("../../mock-modules").dumpCache();
    React = require("../../React");
  });

  describe('reconciliation', function() {
    it('should update children when possible', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUpdate = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: 'MockComponent',
        componentDidMount: mockMount,
        componentDidUpdate: mockUpdate,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.DOM.span(null );
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUpdate.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, MockComponent(null )), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUpdate.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, MockComponent(null )), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUpdate.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);
    });

    it('should replace children with different constructors', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: 'MockComponent',
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.DOM.span(null );
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, MockComponent(null )), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, React.DOM.span(null )), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should replace children with different owners', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: 'MockComponent',
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.DOM.span(null );
        }
      });

      var WrapperComponent = React.createClass({displayName: 'WrapperComponent',
        render: function() {
          return this.props.children || MockComponent(null );
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(WrapperComponent(null ), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(
        WrapperComponent(null, MockComponent(null )),
        container
      );

      expect(mockMount.mock.calls.length).toBe(2);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should replace children with different keys', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: 'MockComponent',
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.DOM.span(null );
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, MockComponent( {key:"A"} )), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.renderComponent(React.DOM.div(null, MockComponent( {key:"B"} )), container);

      expect(mockMount.mock.calls.length).toBe(2);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });
  });

  describe('innerHTML', function() {
    var setInnerHTML;

    // Only run this suite if `Element.prototype.innerHTML` can be spied on.
    var innerHTMLDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'innerHTML'
    );
    if (!innerHTMLDescriptor) {
      return;
    }

    beforeEach(function() {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: setInnerHTML = jasmine.createSpy().andCallFake(
          innerHTMLDescriptor.set
        )
      });
    });

    it('should only set `innerHTML` once on update', function() {
      var container = document.createElement('div');

      React.renderComponent(
        React.DOM.div(null, 
          React.DOM.p(null, React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null ))
        ),
        container
      );
      // Warm the cache used by `getMarkupWrap`.
      React.renderComponent(
        React.DOM.div(null, 
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null ))
        ),
        container
      );
      expect(setInnerHTML).toHaveBeenCalled();
      var callCountOnMount = setInnerHTML.callCount;

      React.renderComponent(
        React.DOM.div(null, 
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null ),React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null ),React.DOM.span(null )),
          React.DOM.p(null, React.DOM.span(null ),React.DOM.span(null ),React.DOM.span(null ))
        ),
        container
      );
      expect(setInnerHTML.callCount).toBe(callCountOnMount + 1);
    });
  });
});

require("../../mock-modules").register("core/__tests__/ReactMultiChild-test", module);
