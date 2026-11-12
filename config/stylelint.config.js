/**
 * Full Stylelint config for @stanislas-poisson projects.
 *
 * The default export is the config. To change the order of the properties or of the elements of a block, a project
 * builds its own with `createStylelintConfig`: each option is a function that receives the list (a copy) and returns
 * the new one, so that it can add, remove or reorder anything.
 *
 *   import { createStylelintConfig } from '@stanislas-poisson/js-dev-tools/stylelint'
 *
 *   export default createStylelintConfig({
 *     // add a property after another, remove one, or move one
 *     properties: (list) => {
 *       list.splice(list.indexOf('cursor') + 1, 0, 'my-property')
 *
 *       return list.filter((property) => property !== 'float')
 *     },
 *     // any other rule of the project
 *     rules: { 'color-named': 'never' },
 *   })
 *
 * `propertyGroups` (the properties by group, in order), `propertiesOrder` and `blockOrder` are exported too.
 */

import { resolve } from './resolve.js'

// The sides of a box. The physical ones follow the order of the CSS shorthands (clockwise: top, right, bottom, left).
// The logical ones come after: the block axis before the inline axis, and the start before the end.
const sides = [
  'top',
  'right',
  'bottom',
  'left',
  'block',
  'block-start',
  'block-end',
  'inline',
  'inline-start',
  'inline-end',
]

// A shorthand, then its longhands by side: `margin`, `margin-top`, ... `margin-inline-end`
const family = (name) => [name, ...sides.map((side) => `${name}-${side}`)]

// A side of the border with its width, style and color: `border-top`, `border-top-width`, `border-top-style`, ...
const borderSides = sides.flatMap((side) => [
  `border-${side}`,
  `border-${side}-width`,
  `border-${side}-style`,
  `border-${side}-color`,
])

// The properties by group. A vendor-prefixed property is placed like its unprefixed one.
export const propertyGroups = {
  reset: ['all'],

  content: ['content', 'quotes', 'counter-reset', 'counter-increment'],

  positioning: [
    'position',
    'inset',
    'top',
    'right',
    'bottom',
    'left',
    'inset-block',
    'inset-block-start',
    'inset-block-end',
    'inset-inline',
    'inset-inline-start',
    'inset-inline-end',
    'z-index',
    'float',
    'clear',
  ],

  layout: [
    'display',
    'flex',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'flex-flow',
    'flex-direction',
    'flex-wrap',
    'place-content',
    'justify-content',
    'align-content',
    'place-items',
    'justify-items',
    'align-items',
    'place-self',
    'justify-self',
    'align-self',
    'order',
    'grid',
    'grid-template',
    'grid-template-rows',
    'grid-template-columns',
    'grid-template-areas',
    'grid-auto-rows',
    'grid-auto-columns',
    'grid-auto-flow',
    'grid-area',
    'grid-row',
    'grid-row-start',
    'grid-row-end',
    'grid-column',
    'grid-column-start',
    'grid-column-end',
    'grid-gap',
    'grid-row-gap',
    'grid-column-gap',
    'gap',
    'row-gap',
    'column-gap',
    'columns',
    'column-count',
    'column-width',
    'break-before',
    'break-after',
    'break-inside',
    'contain',
    'content-visibility',
    'container',
    'container-type',
    'container-name',
  ],

  boxModel: [
    'box-sizing',
    'width',
    'inline-size',
    'min-width',
    'min-inline-size',
    'max-width',
    'max-inline-size',
    'height',
    'block-size',
    'min-height',
    'min-block-size',
    'max-height',
    'max-block-size',
    'aspect-ratio',
    ...family('margin'),
    ...family('padding'),
    'border',
    'border-width',
    'border-style',
    'border-color',
    ...borderSides,
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'border-start-start-radius',
    'border-start-end-radius',
    'border-end-end-radius',
    'border-end-start-radius',
    'border-collapse',
    'border-spacing',
    'outline',
    'outline-width',
    'outline-style',
    'outline-color',
    'outline-offset',
  ],

  typography: [
    'font',
    'font-family',
    // The descriptors of @font-face
    'src',
    'font-display',
    'font-size',
    'font-weight',
    'font-style',
    'font-variant',
    'font-variant-numeric',
    'font-feature-settings',
    'font-smoothing',
    'line-height',
    'letter-spacing',
    'word-spacing',
    'text-align',
    'text-align-last',
    'vertical-align',
    'text-decoration',
    'text-decoration-line',
    'text-decoration-style',
    'text-decoration-color',
    'text-decoration-thickness',
    'text-underline-offset',
    'text-indent',
    'text-overflow',
    'text-transform',
    'text-shadow',
    'text-wrap',
    'text-size-adjust',
    'hyphens',
    'white-space',
    'word-break',
    'word-wrap',
    'overflow-wrap',
    'tab-size',
    'direction',
    'writing-mode',
    'list-style',
    'list-style-type',
    'list-style-position',
    'list-style-image',
    'unicode-range',
  ],

  visual: [
    'color',
    'text-fill-color',
    'accent-color',
    'caret-color',
    'color-scheme',
    'background',
    'background-color',
    'background-image',
    'background-repeat',
    'background-position',
    'background-size',
    'background-origin',
    'background-clip',
    'background-attachment',
    'fill',
    'stroke',
    'stroke-width',
    'object-fit',
    'object-position',
    'mask',
    'mask-image',
    'mask-size',
    'mask-repeat',
    'mask-position',
    'clip',
    'clip-path',
    'box-shadow',
    'filter',
    'backdrop-filter',
    'mix-blend-mode',
    'isolation',
    'opacity',
    'visibility',
    'overflow',
    'overflow-x',
    'overflow-y',
    'overflow-block',
    'overflow-inline',
  ],

  transformsAndAnimations: [
    'transform',
    'transform-origin',
    'transform-style',
    'translate',
    'rotate',
    'scale',
    'perspective',
    'perspective-origin',
    'backface-visibility',
    'transition',
    'transition-property',
    'transition-duration',
    'transition-timing-function',
    'transition-delay',
    'animation',
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
    'animation-play-state',
    'will-change',
  ],

  miscellaneous: [
    'cursor',
    'user-select',
    'pointer-events',
    'touch-action',
    'resize',
    'appearance',
    'scroll-behavior',
    'scroll-snap-type',
    'scroll-snap-align',
    'scrollbar-width',
    'scrollbar-gutter',
    'overscroll-behavior',
  ],
}

// All the properties in order. The ones that are not listed go last, in alphabetical order.
export const propertiesOrder = Object.values(propertyGroups).flat()

// The order of the elements of a block: only what is safe to move. The control directives (@if, @each...) set variables
// and emit declarations in place, and a custom property can override what a mixin emits, so the rest keeps the order
// of the author (the autofix would otherwise change the compiled CSS).
export const blockOrder = [
  'dollar-variables',
  'at-variables',
  { type: 'at-rule', name: 'extend' },
  { type: 'at-rule', name: 'include', hasBlock: false },
]

/**
 * Builds the config. `properties` and `blocks` receive a copy of the list and return the new one; `rules` is merged
 * over the rules of the base.
 */
export const createStylelintConfig = ({
  blocks = (list) => list,
  properties = (list) => list,
  rules = {},
} = {}) => ({
  extends: [
    // Base SCSS rules
    'stylelint-config-standard-scss',
    // Vue SFC support
    'stylelint-config-recommended-vue',
    // HTML support
    'stylelint-config-html',
  ].map(resolve),
  plugins: ['stylelint-scss', 'stylelint-order'].map(resolve),

  rules: {
    // SCSS basics
    'declaration-block-no-redundant-longhand-properties': true,
    'length-zero-no-unit': true,

    // SCSS operator & function rules
    'scss/at-rule-no-unknown': true,
    'scss/at-mixin-argumentless-call-parentheses': 'never',

    // Naming conventions
    'scss/dollar-variable-pattern': '^[_a-z0-9\\-]+$',
    'scss/selector-no-redundant-nesting-selector': true,

    // Order of the elements inside a block
    'order/order': [blocks([...blockOrder]), { unspecified: 'ignore' }],

    // Order of the properties inside a declaration block
    'order/properties-order': [
      properties([...propertiesOrder]),
      { unspecified: 'bottomAlphabetical' },
    ],

    ...rules,
  },
})

export default createStylelintConfig()
