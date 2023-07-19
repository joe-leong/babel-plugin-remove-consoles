const fs = require('fs')
const { resolve } = require('path')
const babel = require('@babel/core');
const customPlugin = require('../custom-plugin');
const babelConfig = ({exclude=['error'],commetnWords=[]}) => {
  return {
    plugins: [
      [
        customPlugin,
        {
          env: 'production',
          exclude,
          commetnWords
        }
      ]
    ]
  }
};
module.exports = ({code,exclude}) => {
  const result = babel.transformSync(code, babelConfig({exclude}))
  return result.code
}
