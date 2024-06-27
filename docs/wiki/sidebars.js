/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  guideSidebar: [{type: 'autogenerated', dirName: 'tutorial-basics'}],

  // But you can create a sidebar manually
  quickstart: [
    {
      type: 'category',
      label: 'Quickstart',
      // dirName: 'quickstart',
      items: ['quickstart/prerequisites',
       'quickstart/register', 'quickstart/activate',],
    },
  ],

};

export default sidebars;
