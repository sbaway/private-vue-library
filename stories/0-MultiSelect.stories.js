import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { withKnobs, text, boolean, select, color } from '@storybook/addon-knobs'

import MultiSelect from './components/MultiSelect.vue'
import options from './config/multiSelectOptions'

export default {
  title: 'MultiSelect',
  decorators: [withKnobs],
}

export const basic = () => ({
  components: { MultiSelect },
  props: {
    options: {
      default: options,
    },
  },
  template: '<multi-select @click="action" :options="options">Hello Button</multi-select>',
  methods: { action: action('clicked') },
})

export const withProps = () => ({
  title: 'with props',
  components: { MultiSelect },
  props: {
    placeholder: {
      default: text('placeholder', '请选择城市'),
    },
    label: {
      default: text('label', '我是label'),
    },
    isRequired: {
      default: boolean('isRequired', false),
    },
    options: {
      default: options,
    },
    tagColor: {
      default: color('tagColor', '#409eff'),
    },
  },
  template: `<multi-select :isRequired="isRequired" :options="options" :tagColor="tagColor" :label="label" :placeholder="placeholder" />`,
})
