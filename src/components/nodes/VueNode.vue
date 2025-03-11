<template>
  <div class="node-box">
    <div :class="['node']">
      <!--头部-->
      <div class="node-header">
        <div class="head">
          <div >
            {{ 'hello' }}
          </div>
        </div>
      </div>
      <!--插槽内容-->
      <div class="node-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    properties: {
      type: Object,
      default: () => ({
        t: 1,
        style: {}
      })
    },
    text: String,
  },
  data() {
    return {
      showTitle: '',
      increaseFactor: 0,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
      color: '#8c7cf3'
    }
  },
  computed: {
    headerColor() {
      return this.properties?.status === 'success' ? 'rgb(101, 221, 165)' : '#8c7cf3'
    }
  },
  emits: ['btnClick'],
  mounted() {
    console.log(this)
  },
  watch: {
    'properties.t': {
      handler(val) {
        this.increaseFactor = val
      },
      immediate: true
    }
  }
}
</script>
<style scoped>
.node-box {
  position: relative;
}

.node-box:after {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translate(-50%);
  border-style: solid;
  width: 0;
  border-width: 8px 6px 4px;
  border-color: var(--el-border-color) transparent transparent;
  background-color: var(--flow-bg-color);
}

.warn-icon {
  cursor: pointer;
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--el-color-error);
}

.node {
  border-radius: 7px;
  cursor: pointer;
  position: relative;
  min-height: 90px;
  width: 230px;
  z-index: 10;
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);

}
.node-header {
  
  padding: 2px 7px;
  border-radius: 7px 7px 0 0;
  background: v-bind(headerColor);
  box-sizing: border-box;
  border-bottom: 1px solid var(--el-border-color-light);
}
.node-header.error-node {
    box-shadow: 0 0 5px 0 var(--el-color-error-light-3);
  }
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  :deep(.el-input__wrapper) {
    background-color: var(--el-bg-color-overlay);
  }
}
.node-close {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
  display: none;
}
.node-content {
  position: relative;
  padding: 20px;
}
.node:hover {
  &:not(.error-node) {
    box-shadow: 0 0 5px 0 var(--el-color-primary);
  }

  .node-close {
    display: block;
  }
}
</style>