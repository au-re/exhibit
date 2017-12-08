/*  eslint-disable */

import { Exhibit } from "./lib";
import Markdown from "markdown-to-jsx";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import readme from "../README.md";
import registerServiceWorker from './registerServiceWorker';

/* FETCH THE DEMO DATA */
// TODO the function "requireAllDemos" should be part of react-exhibit!!

// .../MySubComponent/${stop}/... -> 'MySubComponent'
function extractComponentName(path, stop) {
  const pathSplit = path.split("/");
  return pathSplit[pathSplit.indexOf(stop) - 1];
}

function extractDemoName(path) {
  return path.split("/").slice(-1)[0].slice(0, -3);
}

// only render documentation with the tag "export"
function filterDocs(docs) {
  return docs.filter((doc) => doc.comment && doc.tags && doc.tags[0].title === "export");
}

/**
 * Go through the entire ./src folder, load all demos from the `demo` folders
 * If a `demo` folder was present also load the JSDOC documentation of the
 * component. Creates an object for each component and add to it:
 *
 * 1. the demos
 * 2. the raw code of the demos
 * 3. the JSDOC infos from the component `index.js`
 *
 * Nested components will also be handled properly.
 * If you don't want a component to be demoed, simply don't add a `demo` folder
 * to it.
 *
 * @returns {object} - object with values to be rendered in the docs
 */
function requireAllDemos() {
  const components = {};
  const demoSources = require.context("!!raw-loader!./", true, /demo\/.*\.js$/);
  const demos = require.context("./", true, /demo\/.*\.js$/);
  const docs = require.context("!!raw-loader!jsdoc2js-loader!./", true, /.*[^.]\/index.js/);

  console.log(demos.keys());
  console.log(demoSources.keys());
  console.log(docs.keys());

  demos.keys().forEach((key) => {
    const componentName = extractComponentName(key, "demo");
    const demoName = extractDemoName(key);

    if (_.isEmpty(components[componentName])) {
      console.log(components[componentName]);
      components[componentName] = {
        demo: {},
        docs: {}
      }
    }

    components[componentName].demo = Object.assign({}, components[componentName].demo, {
      [demoName]: {
        source: demoSources(key),
        component: demos(key)
      }
    })
    console.log({
      [demoName]: {
        source: demoSources(key),
        component: demos(key)
      }
    });
  });

  docs.keys().forEach((key) => {
    const name = extractComponentName(key, "index.js");
    if (components[name]) {
      components[name].docs = filterDocs(docs(key));
    }
  });

  return components;
}

/* RENDER THE DEMO DATA */

ReactDOM.render(
  <Router>
    <Exhibit
      readme={<Markdown>{readme}</Markdown>}
      baseURL={process.env.PUBLIC_URL}
      label="react-exhibit"
      components={requireAllDemos()} />
  </Router>,
  document.getElementById("root"));

registerServiceWorker();
