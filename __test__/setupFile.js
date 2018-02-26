const { JSDOM } = require('jsdom');
const $ = require('jquery');
const { connect } = require('react-redux');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop)
    }), {});
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js'
};
copyProps(window, global);
global.window.$ = $;
const rootDiv = document.createElement('div');
rootDiv.id = 'root';
rootDiv.style.width = '1024px';
global.document.body.appendChild(rootDiv);

const resizeEvent = global.document.createEvent('Event');
resizeEvent.initEvent('resize', true, true);

global.window.resizeTo = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = height || global.window.innerHeight;
  global.window.dispatchEvent(resizeEvent);
};
global.window.connect = connect;

global.window.CC = {};


global.window.CC_RAILS_ENV = {
  cdm_product_catalogue_url: ''
};

global.mockData = [
  {
    "column1": "1",
    "column2": "column2"
  },
  {
    "column1": "2",
    "column2": "column2"
  },
  {
    "column1": "3",
    "column2": "column2"
  },
  {
    "column1": "4",
    "column2": "column2"
  },
  {
    "column1": "5",
    "column2": "column2"
  },
  {
    "column1": "6",
    "column2": "column2"
  },
  {
    "column1": "7",
    "column2": "column2"
  }
];
