import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import Search from './components/Search.vue'

export default {
  title: 'Search',
}

export const basic = () => ({
  components: { Search },
  data() {
    return {
      config: [
        {
          type: 'input',
          modelKey: 'tenementId',
          label: '租户ID',
          placeholder: '租户ID',
        },
        {
          type: 'input',
          modelKey: 'tenementName',
          label: '租户名称',
          placeholder: '租户名称',
        },
        {
          type: 'select',
          modelKey: 'state',
          label: '认证状态',
          placeholder: '请选择',
          defaultValue: 1,
          options: [
            {
              value: '',
              label: '全部',
            },
            {
              value: 1,
              label: '待审核',
            },
            {
              value: 3,
              label: '已认证',
            },
            {
              value: 2,
              label: '未通过',
            },
          ],
        },
        {
          type: 'rangeDate',
          modelKey: ['startAt', 'endAt'],
          label: '创建时间',
          rangeSeparator: '至',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
        },
      ],
      searchHandler: () => {
        console.log('search...')
      },
    }
  },
  template: '<search :config="config" @searchHandler="searchHandler" />',
  methods: { action: action('clicked') },
})
