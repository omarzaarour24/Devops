module.exports = {
  'env': {
    'node': true,
    'mocha': true,
  },
  'extends': ['eslint:recommended', 'google'],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'rules': {
    'max-len': ['error', {'code': 200}],
  },
};
