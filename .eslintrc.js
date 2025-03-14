module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'check-file', 'security', 'import', 'unused-imports'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules/*', 'dist/*', 'scripts/*', 'test/configs/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-console': 'error',
    'no-restricted-imports': ['error', { patterns: ['^libs', './libs', 'apps'] }],
    'no-return-await': 'error',
    'id-length': ['error', { min: 2 }],
    'security/detect-bidi-characters': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    'check-file/folder-naming-convention': ['error', { '**': 'KEBAB_CASE' }],
    'check-file/folder-match-with-fex': ['error', { '*.{*spec,mock*}.ts': '**/_test/**' }],
    'check-file/filename-naming-convention': ['error', { '**': 'SNAKE_CASE' }, { ignoreMiddleExtensions: true }],
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    'max-lines': ['error', { max: 500 }],
    'max-depth': ['error', { max: 4 }],
    complexity: ['error', { max: 10 }],
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'error',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [['external', 'builtin'], 'internal', ['parent', 'sibling'], 'index'],
        pathGroups: [
          { pattern: '@otg', group: 'internal' },
          { pattern: '@otg/**', group: 'internal' },
          { pattern: '@test', group: 'internal' },
          { pattern: '@test/**', group: 'internal' },
        ],
        pathGroupsExcludedImportTypes: ['internal'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': 'off', // Disable to avoid conflicts with unused-imports/no-unused-vars
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'method',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
      {
        selector: 'method',
        modifiers: ['protected'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'method',
        modifiers: ['public'],
        format: ['camelCase'],
        leadingUnderscore: 'forbid',
      },
    ],
  },
  overrides: [
    {
      files: ['**/_test/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false }],
        'check-file/folder-naming-convention': 'off',
      },
    },
    {
      files: ['**/_test/**/*spec.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/valid-title': 'off',
        'jest/prefer-to-be': 'error',
        'jest/prefer-to-contain': 'error',
        'jest/prefer-to-have-length': 'error',
        'jest/prefer-expect-resolves': 'error',
        'jest/expect-expect': 'off', // TODO: fix and set to error
      },
    },
    {
      files: ['*.constants.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['UPPER_CASE'],
          },
        ],
      },
    },
  ],
};
