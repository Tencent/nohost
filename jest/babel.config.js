module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {    
            node: 'current',
          },
        }
      ],
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-clas s-properties', { loose: true }],
    ],
    test: [
        "jest"
    ]
  };