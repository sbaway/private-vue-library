<template>
  <div class="multi-select">
    <!-- 选择框 -->
    <div class="select-input-wrap">
      <label
        class="label"
        v-if="label"
        @click="toggleOptions"
      >
        <span
          class="highlight"
          v-if="isRequired"
        >*</span>
        {{ label }}
      </label>
      <div
        class="select-input"
        :class="{ 'input-active': isOptionsShow }"
        @click="inputClickHandler"
      >
        <div class="select-item-wrap">
          <div
            class="select-item"
            :style="{background: tagColor, borderColor: tagColor}"
            v-for="item in tempSavedTags"
            :key="item.value"
          >
            <span class="item-label">{{ item.label }}</span>
            <span
              class="del-item-btn"
              @click="() => deleteCurrentItem(item.value)"
            >
              <i class="el-icon-close" />
            </span>
          </div>
        </div>
        <span
          v-if="!tempSavedTags.length"
          class="select-placeholder"
        >{{ placeholder }}</span>
        <span
          class="arrow-wrap"
          :class="{ clockwise: isOptionsShow, anticlockwise: !isOptionsShow }"
        >
          <i class="el-icon-caret-bottom"></i>
        </span>
      </div>
    </div>

    <!-- 选项 -->
    <div
      class="options-content-wrap"
      :class="{ 'options-transition': isOptionsShow, 'options-collapse': !isOptionsShow }"
    >
      <div class="options-content">
        <el-input
          v-model="searchValue"
          class="search-input"
          placeholder="搜索"
          type="text"
          @input="searchOptions"
        />
        <div
          v-if="options.length"
          class="options-group-wrap"
        >
          <div
            v-for="parent in options"
            class="options-group"
            :key="parent.groupId"
          >
            <div class="parent">
              <el-checkbox
                :indeterminate="indeterminateStatus[parent.groupId]"
                :value="checkAllStatus[parent.groupId]"
                @change="() => handleCheckAllChange(parent.groupId)"
              >
                <span>{{ parent.label }}</span>
              </el-checkbox>
            </div>
            <div class="child-wrap">
              <el-checkbox-group
                v-model="selectData"
                @change="value => handleChildChange(value, parent.groupId)"
              >
                <el-checkbox
                  v-for="child in parent.children"
                  :label="child.value"
                  :key="child.value"
                  class="child"
                >
                  {{ child.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
        <div
          class="no-data"
          v-else
        >
          <span>暂无数据</span>
        </div>
        <div class="btn-wrap">
          <el-button
            size="small"
            type="primary"
            @click="saveTag"
          >保存</el-button>
          <el-button
            size="small"
            @click="cancel"
          >取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import clone from 'clone'

export default {
  props: {
    placeholder: {
      type: String,
      default: '请选择',
    },
    label: {
      type: String,
    },
    options: {
      type: Array,
      default: () => [],
    },
    change: {
      type: Function,
      default: () => {},
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    tagColor: {
      type: String,
      default: '#409eff',
    },
  },

  data() {
    return {
      isOptionsShow: false,
      tempSavedTags: [],
      selectData: [],
      indeterminateStatus: {},
      checkAllStatus: {},
      searchValue: ''
    }
  },

  methods: {
    setOptionsPosition() {
      const selectInput = document.querySelector('.select-input')
      const options = document.querySelector('.options-content-wrap')
      const selectHeight = selectInput.offsetHeight
      options.style.top = `${selectHeight + 5}px`
    },

    // 点击input框
    inputClickHandler(e) {
      const className = e.target.className
      if (
        className.indexOf('select-input') !== -1 ||
        className.indexOf('select-item-wrap') !== -1 ||
        className.indexOf('select-placeholder') !== -1
      ) {
        this.isOptionsShow = !this.isOptionsShow
        if (this.isOptionsShow) {
          this.setOptionsPosition()
        } else {
          this.cancel()
          this.searchOptions('')
        }
      }
    },

    // 保存
    saveTag() {
      let allOptions
      if (this.options.length === 1) {
        allOptions = this.options[0].children
      } else {
        allOptions = this.options.reduce((p, c) => {
          const pre = p.children || p
          return pre.concat(c.children)
        })
      }
      this.tempSavedTags = allOptions.filter(_ => this.selectData.includes(_.value))
      this.isOptionsShow = false
      // 调用父组件传递的回调函数
      this.change(this.tempSavedTags.map(_ => _.value))
    },

    // 删除input框中已保存的option
    deleteCurrentItem(value) {
      this.selectData.splice(this.selectData.indexOf(value), 1)
      this.tempSavedTags = this.tempSavedTags.filter(_ => _.value !== value)
      const groupId = this.options.filter(_ => {
        const children = _.children
        const temp = children.filter(child => child.value === value)
        return temp.length
      })[0].groupId
      this.handleChildChange(this.selectData, groupId)
      this.change(this.tempSavedTags.map(_ => _.value))
    },

    toggleOptions(e) {
      this.isOptionsShow = !this.isOptionsShow
    },

    // group全选
    handleCheckAllChange(groupId) {
      const groupCheckboxValue = this.options.filter(parent => parent.groupId === groupId)[0].children.map(_ => _.value)
      if (this.checkAllStatus[groupId]) {
        this.$set(this.checkAllStatus, groupId, false)
        for (let i = 0; i < groupCheckboxValue.length; i++) {
          if (this.selectData.includes(groupCheckboxValue[i])) {
            this.selectData.splice(this.selectData.indexOf(groupCheckboxValue[i]), 1)
          }
        }
      } else {
        this.$set(this.checkAllStatus, groupId, true)
        this.$set(this.indeterminateStatus, groupId, false)
        this.selectData = this.selectData.concat(groupCheckboxValue.filter(_ => !this.selectData.includes(_)))
      }
    },

    // group子选项单选
    handleChildChange(value, groupId) {
      const groupCheckboxValue = this.options.filter(parent => parent.groupId === groupId)[0].children.map(_ => _.value)
      const isCurrentGroupCheckedAll = !groupCheckboxValue.filter(_ => !value.includes(_)).length
      const isCurrentGroupChecked = value.filter(_ => groupCheckboxValue.includes(_)).length
      if (isCurrentGroupCheckedAll) {
        this.$set(this.checkAllStatus, groupId, true)
      } else {
        this.$set(this.checkAllStatus, groupId, false)
      }
      if (isCurrentGroupChecked && !isCurrentGroupCheckedAll) {
        this.$set(this.indeterminateStatus, groupId, true)
      } else {
        this.$set(this.indeterminateStatus, groupId, false)
      }
    },

    // 根据选中的option查找option所在的组
    findGroup(selectData) {
      const group = this.options.filter(parent => {
        const children = parent.children
        const hasChild = children.filter(child => {
          return selectData.includes(child.value)
        }).length
        return hasChild
      })
      return group
    },

    // 取消操作
    cancel() {
      this.isOptionsShow = false
      const savedOptionId = this.tempSavedTags.map(_ => _.value)
      const addNotSavedData = this.selectData.filter(_ => !savedOptionId.includes(_))
      const desNotSavedData = savedOptionId.filter(_ => !this.selectData.includes(_))
      const notSavedSelectData = addNotSavedData.length ? addNotSavedData : desNotSavedData
      const notSavedGroup = this.findGroup(notSavedSelectData)
      this.selectData = savedOptionId
      notSavedGroup.forEach(group => {
        this.handleChildChange(this.selectData, group.groupId)
      })
      this.searchOptions('')
      this.searchValue = ''
    },

    // 搜索选项
    searchOptions(value) {
      const cloneOptions = clone(this.options)
      const searchValue = value.replace(/\s+/g, '')
      if (!searchValue) {
        this.options = cloneOptions
        return
      }
      const filterOptions = cloneOptions
        .map(_ => {
          if (_.label.indexOf(searchValue) !== -1) {
            return _
          }
          const children = _.children.filter(child => {
            return child.label.indexOf(searchValue) !== -1
          })
          if (children.length) {
            _.children = children
            return _
          }
          return
        })
        .filter(_ => _)
      this.options = filterOptions
    },
  },
}
</script>

<style lang="scss" scoped>
$border-color: #dcdfe6;
$tag-color: #409eff;
.multi-select {
  position: relative;
  font-size: 14px;
}
.select-input-wrap {
  display: flex;
  width: 100%;
}
.label {
  margin-right: 10px;
  flex-shrink: 0;
  flex-grow: 0;
  color: #333;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.select-input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 0 15px;
  outline: 0;
  color: #606266;
  appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid $border-color;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  cursor: pointer;
  &:hover {
    border: 1px solid #ccc;
    box-shadow: 0px 1px 10px 1px #eee;
    transition: all 0.3s;
  }
  &.input-active {
    border: 1px solid $tag-color;
  }
  .select-item-wrap {
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 10px;
    .select-item {
      flex-shrink: 0;
      margin: 10px 10px 0 0;
      padding: 2px 6px;
      border-radius: 4px;
      background: $tag-color;
      border: 1px solid $tag-color;
      color: #fff;
      .el-icon-close {
        position: relative;
        top: 1px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
  .arrow-wrap {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: rotate(0) translateY(-50%);
    transform-origin: top;
  }
  .clockwise {
    transform: rotate(-180deg) translateY(-50%);
    transition: all 0.3s;
  }
  .anticlockwise {
    transform: rotate(0) translateY(-50%);
    transition: all 0.3s;
  }
}
.options-content-wrap {
  position: absolute;
  width: 100%;
  z-index: 10;
  height: 0;
  overflow: hidden;
  background: #fff;
}
.options-transition {
  height: auto;
  transition: all 0.2s ease-out;
}
.options-collapse {
  height: 0;
  transition: all 0.2s ease-out;
}
.options-content {
  position: relative;
  padding: 15px 15px 30px 15px;
  border: 1px solid $border-color;
  margin-top: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  &:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 30px;
    transform: rotate(45deg);
    background: #fff;
    z-index: 9;
    height: 15px;
    width: 15px;
    border-top: 1px solid $border-color;
    border-left: 1px solid $border-color;
  }
  .options-group {
    display: flex;
    margin-top: 20px;
    margin-right: 15px;
    .parent {
      width: 20%;
      flex-shrink: 0;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      /deep/ .el-checkbox__inner {
        height: 16px;
        width: 16px;
      }
      /deep/ .el-checkbox__label {
        font-size: 16px;
        font-weight: bold;
        font-family: auto;
        > span {
          display: inline-block;
          width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }
      }
    }
    .child-wrap {
      display: flex;
      .child {
        margin: 0 50px 10px 0;
      }
    }
  }
  .no-data {
    padding: 40px 0 20px;
    color: #666;
    text-align: center;
    font-size: 14px;
  }
  .btn-wrap {
    margin-top: 25px;
    text-align: center;
  }
}
.highlight {
  color: red;
}
</style>
