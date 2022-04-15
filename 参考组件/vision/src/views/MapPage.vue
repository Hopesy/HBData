<!--
针对于 /mappage 这条路径而显示出来的
在这个组件中, 通过子组件注册的方式, 要显示出Map.vue这个组件
-->
<template>
  <div class="com-page">
    <single-map></single-map>
  </div>
</template>

<script>
// ../上一级目录../../上上一级目录./当前目录/根目录@忽略转义字符
import Map from '@/components/Map'
export default {
  data () {
    return {}
  },
  methods: {},
  components: {
    'single-map': Map
  }
}
</script>

<style lang="less" scoped>
</style>
