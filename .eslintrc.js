module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  globals: {
    build: 'readonly',
  },
  plugins: [
    'prettier',
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'unused-imports',
    'jest',
    'jest-formatting',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:jest-formatting/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // recommended config for integrating prettier
    'prettier/prettier': ['error', { singleQuote: true, printWidth: 100 }],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    // end of prettier related config

    'max-depth': 'error',
    'max-statements': ['error', 20],
    '@typescript-eslint/no-explicit-any': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-commonjs': 'off',
        'import/no-nodejs-modules': 'off',
        'import/no-unassigned-import': 'off',
      },
    },
    {
      files: ['*.json'],
      rules: {
        quotes: ['error', 'double'],
        'max-lines': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    {
      files: ['*.*.ts'],
      rules: {
        'max-statements': ['error', 25],
        '@typescript-eslint/ban-ts-comment': 0,
        'sonarjs/no-duplicate-string': 'off',
      },
    },

    //
    // all unit test files
    //
    {
      files: ['*.spec.ts', '*.e2e.ts'],
      env: {
        'jest/globals': true,
      },
      extends: ['plugin:jest/recommended', 'plugin:jest/style', 'plugin:jest-formatting/strict'],
      rules: {
        '@typescript-eslint/ban-types': 'off',
        'jest/no-test-prefixes': 'off',
        'import/no-nodejs-modules': 'off',

        'jest/no-test-return-statement': 'error',
        'jest/consistent-test-it': 'error',
        'jest/no-duplicate-hooks': 'error',
        'jest/no-if': 'error',
        'jest/no-restricted-matchers': [
          'error',
          {
            toBeFalsy: 'Use `toBeFalse` from jest-extended instead',
          },
        ],
        'jest/require-to-throw-message': 'error',
        'jest/prefer-hooks-on-top': 'error',
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['expect', 'expect*'],
          },
        ],

        'max-statements': ['error', 20],
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
        'no-undef': 'off',
        'vue/one-component-per-file': 'off',
      },
    },
  ],
};
