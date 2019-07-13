// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 8,
  },
  env: {
    browser: true,
    mocha: true,
    jasmine: true,
    es6: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ['plugin:vue/recommended', 'airbnb-base'],
  // required to lint *.vue files
  plugins: [
    'vue',
    'html'
  ],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  rules: {

    /**
    * Allowances
    */

    'vue/max-attributes-per-line': 'off',
    'no-plusplus':0,
    'no-inner-declarations': 0,
    'class-methods-use-this': [0, { 'exceptMethods': ['data', 'computed'] }],
    'vue/no-v-html': 0,
    /**
    * General
    */

    // This will throw warnings anywhere 'use strict' occurs, which is good.
    'strict': [2, 'never'],

    /**
    * Errors
    */

    'curly': [2, 'multi-line'],
    'no-cond-assign': [2, 'always'],  // This is why you should yoda :p
    'no-constant-condition': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-else-return': 2,
    'no-eq-null': 2,
    'no-eval': 2,
    'no-ex-assign': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-semi': 2,
    'no-func-assign': 2,
    'no-implied-eval': 2,
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-native-reassign': 2,
    'no-new': 2,
    'no-new-func': 2,
    'no-new-wrappers': 2,
    'no-obj-calls': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-return-assign': 2,
    'no-script-url': 2,     // No need for these in Meteor!
    'no-self-compare': 2,
    'no-sequences': 2,      // I hate that!
    'no-shadow': [1, {'hoist': 'functions'}],
    'no-sparse-arrays': 2,
    'no-unreachable': 2,
    'no-with': 2,
    'use-isnan': 2,
    'wrap-iife': [2, 'any'],

    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {props: false}],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': 'error',
    'max-len': 'off',
    'eqeqeq': 'warn',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    /**
    * Warnings
    */

    'comma-dangle': [1, 'always-multiline'],
    'consistent-return': 1,
    'default-case': 1,          // *If* you happen to use a switch, maybe you don't want a default
    'guard-for-in': 1,
    'no-alert': 1,
    'no-caller': 1,             // Should be 2, but there is some code out there... ;>
    'no-debugger': 1,
    'no-extra-boolean-cast': 1,   // I should give it a 2 but being nice!! (Sasha uses them)
    //                                     ^punny, eh! :D
    'no-fallthrough': 1,          // *If* you happen to.. it shouldn't be often.
    'no-floating-decimal': 1,     // Should be 2, but I bet lots of you...
    'no-multi-str': 1,            // Should be 2, I'm being nice :>
    'no-shadow-restricted-names': 2,
    'no-unused-vars': [1, {
      'vars': 'local',
      'args': 'none'
    }],
    'no-use-before-define': 2,

    /**
    * Style
    */
    'brace-style': [2,
      '1tbs', {
        'allowSingleLine': true
      }
    ],
    'camelcase': [2, {'properties': 'always'}],
    'comma-spacing': [2, {
      'before': false,
      'after': true
    }],
    'comma-style': [2, 'last'],
    'indent': [2, 2, {'SwitchCase': 1}],
    'key-spacing': [2, {
      'afterColon': true,
      'beforeColon': false,
    }
    ], // 'prop': x, extra spacing allowed if lining up blocks
    'linebreak-style': [
      2,
      'unix'
    ],
    'new-cap': 2,
    'no-multiple-empty-lines': 1,
    'no-new-object': 2,         // There are good reasons not to
    'no-array-constructor': 2,  // There are good reasons not to
    'no-trailing-spaces': 2,
    'one-var': [2, 'never'],
    'quotes': [
      2, 'single', 'avoid-escape'
    ],
    'semi': [2, 'always'],
    'semi-spacing': [2, {
      'before': false,
      'after': true
    }],
    'keyword-spacing': [2, {
      'after': true, 'overrides': {
        'if': {'after': false},
        'for': {'after': false},
        'while': {'after': false},
        'switch': {'after': false}
      }
    }],
    'space-before-blocks': 2,
    'space-infix-ops': 2,
    'spaced-comment': [2, 'never'],
  },
  'overrides': [
    {
      'files': [ '*.spec.js' ],
      'globals': {
        assert: true
      },
      'rules': {
        'func-names': 0,
        'no-empty': [2, {'allowEmptyCatch': true}]
      }
    }
  ]
}
