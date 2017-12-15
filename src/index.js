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
  const arr = path.split("/");
  return arr[arr.indexOf(stop) - 1];
}

// .../MySubComponent/${stop}/... -> .../MySubComponent
function extractComponentPath(path, stop) {
  const arr = path.split("/");
  return arr.splice(0, arr.indexOf(stop)).join("/");
}

// .../MySubComponent/demo/usage.js -> usage
function extractDemoName(path) {
  return path.split("/").slice(-1)[0].slice(0, -3);
}

// get the file at the root of the folder
function getComponentIndex(path) {
  return extractComponentPath(path, "demo") + "/index.js";
}

function getComponentReadme(path) {
  return extractComponentPath(path, "demo") + "/README.md";
}

// only render documentation with the tag "export"
function filterDocs(docs) {
  return docs.filter((doc) => doc.comment && doc.tags);
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

  const readMes = require.context("./", true, /.*[^.]\/README.md$/);
  const docs = require.context("!!raw-loader!jsdoc2js-loader!./", true, /.*[^.]\/index.js/);

  console.log("DEMOS:", demos.keys());
  console.log("DOCS:", docs.keys());
  console.log("READMES:", readMes.keys());

  demos.keys().forEach((key) => {
    const componentPath = extractComponentPath(key, "demo");
    const componentName = extractComponentName(key, "demo");
    const demoName = extractDemoName(key);

    console.log(componentPath);

    // initiate component if no demo was found for it
    if (_.isEmpty(components[componentName])) {
      components[componentName] = {
        demo: {},
        docs: {},
        readme: ""
      }
    }

    // load a demo
    components[componentName].demo = Object.assign({}, components[componentName].demo, {
      [demoName]: {
        source: demoSources(key),
        component: demos(key)
      }
    })

    if (docs.keys().includes(getComponentIndex(key))) {
      components[componentName].docs = filterDocs(docs(getComponentIndex(key)));
    }

    if (readMes.keys().includes(getComponentReadme(key))) {
      components[componentName].readme = readMes(getComponentReadme(key))
    }
  });

/*   docs.keys().forEach((key) => {
    const componentName = extractComponentName(key, "index.js");
    const readMeKey = key.replace("index.js", "README.md");
    if (_.isEmpty(components[componentName])) {
      components[componentName] = {
        demo: {},
        docs: {}
      }
    }
    console.log(key);
    components[componentName].docs = filterDocs(docs(key));
  }); */

  return components;
}

/* RENDER THE DEMO DATA */

ReactDOM.render(
  <Router>
    <Exhibit
      readme={<Markdown>{readme}</Markdown>}
      baseURL={process.env.PUBLIC_URL}
      libName="react-exhibit"
      components={requireAllDemos()} />
  </Router>,
  document.getElementById("root"));

registerServiceWorker();

