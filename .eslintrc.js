module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    // 检查 Hooks 的使用规则
    'react-hooks/rules-of-hooks': 'error',
    // 检查依赖项的声明
    'react-hooks/exhaustive-deps': 'warn',
    'prettier/prettier': 'off',
    'no-console': 'off',
    "import/prefer-default-export": "off",
    "no-plusplus": "off",
    "react/no-array-index-key": "off",
    "react/no-unstable-nested-components": "off",
    "camelcase": "off",
    "prefer-destructuring": "off",
    "no-bitwise": "off",
    "react/jsx-props-no-spreading": "off",
    "no-nested-ternary": "off",
    "no-else-return": "off",
    "one-var": "off",
    "no-continue": "off",
    "no-multi-assign": "off"
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
