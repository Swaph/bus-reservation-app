module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'linebreak-style': ['error', 'windows'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'as-needed'],
    'object-curly-newline': ['error', {
      multiline: true,
      consistent: true,
    }],
    'no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true,
    }],
    'consistent-return': 'off',
    'no-alert': 'off',
    'max-len': ['error', {
      code: 120,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true,
    }],
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
    'new-cap': 'off',
    'no-unused-vars': ['error', {
      varsIgnorePattern: '^(searchBuses|viewSeats|selectSeats|bookSeats|goBack|proceedBooking|navigateBack|proceedToBooking|makeAuthenticatedRequest|fetchWithAuth)$',
      argsIgnorePattern: '^(date|busName|seats|seatNumber|departureTime|arrivalTime)$',
    }],
    'import/no-unresolved': ['error', {
      ignore: ['^firebase/'],
    }],
  },
  globals: {
    document: 'readonly',
    window: 'readonly',
    firebase: 'readonly',
    alert: 'readonly',
    confirm: 'readonly',
    sessionStorage: 'readonly',
  },
};
