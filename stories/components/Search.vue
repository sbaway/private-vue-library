<template>
  <div class="search-component">
    <el-form
      :model="searchModel"
      :rules="rules"
      status-icon
      ref="searchModel"
      :label-width="label.width"
      class="search-form"
    >
      <el-row>
        <el-col v-for="(item, index) in config" :key="index" :span="item.span || 8">
          <el-form-item :label="item.label" :prop="!Array.isArray(item.modelKey) && item.modelKey">
            <!-- input-default -->
            <el-input
              v-if="item.type === 'input'"
              :placeholder="item.placeholder"
              :value="searchModel[item.modelKey]"
              :autocomplete="item.autocomplete || 'off'"
              @input="
                value =>
                  searchFormHandler({
                    key: item.modelKey,
                    value,
                  })
              "
            ></el-input>
            <!-- select -->
            <el-select
              v-if="item.type === 'select'"
              :value="searchModel[item.modelKey]"
              :placeholder="item.placeholder"
              :popper-append-to-body="false"
              class="full-width"
              @change="
                value =>
                  searchFormHandler({
                    key: item.modelKey,
                    value,
                  })
              "
            >
              <el-option v-for="option in item.options" :key="option.label" :label="option.label" :value="option.value">
              </el-option>
            </el-select>
            <!-- range-datepicker -->
            <el-date-picker
              v-if="item.type === 'rangeDate'"
              :value="[searchModel[item.modelKey[0]], searchModel[item.modelKey[1]]]"
              type="daterange"
              align="right"
              unlink-panels
              :range-separator="item.rangeSeparator || '至'"
              :start-placeholder="item.startPlaceholder || '开始日期'"
              :end-placeholder="item.endPlaceholder || '结束日期'"
              :picker-options="pickerOptions"
              @input="
                value =>
                  searchFormHandler({
                    key: item.modelKey,
                    type: item.type,
                    value,
                  })
              "
              class="full-width"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item>
            <el-button :loading="loading" type="primary" @click="search">
              搜索
            </el-button>
            <el-button @click="() => resetFormHandler()">
              清空条件
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import groom from 'groom'

export default {
  props: {
    /**
    搜索组件表单配置
     */
    config: {
      type: Array,
      required: true,
      default: () => [],
    },
    /**
    调用者提供的异步方法: 在搜索组件内部通过await调用searchHandler, 来设置或者清楚搜索button的loading状态
     */
    searchHandler: {
      type: Function,
      required: true,
      default: () => {},
    },
    // 搜索表单限制规则
    rules: {
      type: Object,
      default: () => {},
    },
    // 搜索表单的label配置
    label: {
      type: Object,
      default: () => ({
        width: '120px',
      }),
    },
  },
  data() {
    return {
      loading: false,
      searchModel: {},
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近30天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近90天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
    }
  },

  created() {
    this.fillModel()
  },

  methods: {
    fillModel() {
      this.searchModel = this.generateModel({ isReset: false })
    },

    searchFormHandler({ key, type, value }) {
      if (type === 'rangeDate') {
        this.searchModel = {
          ...this.searchModel,
          [key[0]]: this.parseTime(value[0]),
          [key[1]]: `${this.parseTime(value[1], '{y}-{m}-{d}')} 23:59:59`,
        }
      } else {
        this.searchModel = {
          ...this.searchModel,
          [key]: value,
        }
      }
    },

    generateModel({ isReset }) {
      const model = {}
      this.config.forEach(_ => {
        if (_.type === 'rangeDate') {
          model[_.modelKey[0]] = isReset
            ? (_.resetDefaultValue && _.resetDefaultValue[0]) || ''
            : (_.defaultValue && _.defaultValue[0]) || ''
          model[_.modelKey[1]] = isReset
            ? (_.resetDefaultValue && _.resetDefaultValue[1]) || ''
            : (_.defaultValue && _.defaultValue[1]) || ''
        } else {
          model[_.modelKey] = isReset ? _.resetDefaultValue || '' : _.defaultValue || ''
        }
      })
      return model
    },

    resetFormHandler() {
      this.searchModel = this.generateModel({ isReset: true })
      this.search()
    },

    async search() {
      this.loading = true
      const searchCondition = groom(this.searchModel)
      await this.searchHandler(searchCondition)
      this.loading = false
      alert(JSON.stringify(searchCondition))
    },

    parseTime(time, cFormat) {
      if (arguments.length === 0) {
        return null
      }
      const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
      let date
      if (typeof time === 'object') {
        date = time
      } else {
        if (('' + time).length === 10) time = parseInt(time) * 1000
        date = new Date(time)
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay(),
      }
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
        if (result.length > 0 && value < 10) {
          value = '0' + value
        }
        return value || 0
      })
      return time_str
    },
  },
}
</script>

<style lang="scss" scoped>
.search-component {
  padding: 30px 30px 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.search-form {
  min-width: 1200px;
}
.full-width {
  width: 100%;
}
.search-form {
  /deep/ .el-date-editor .el-range-separator {
    width: 24px;
  }
}
</style>
