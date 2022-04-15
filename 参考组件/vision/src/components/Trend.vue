<template>
  <div class="com-container">
    <!-- 自己写一个可以下拉切换的标题 -->
    <!-- v-bind:style标签属性绑定 。属性值用的也是计算属性-->
    <div class="title" :style="comStyle">
    <!-- 单一表达式绑定插值，本例用的计算属性 -->
      <span>{{ '▎ ' +  showTitle }}</span>
      <!-- 字体图标;v-on:click绑定内联事件(取反)切换列表显示状态 -->
      <span class="iconfont title-icon" :style="comStyle"  @click="showChoice = !showChoice">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
      <!-- v-for实现列表 -->
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstane: null,
      allData: null, // 从服务器中获取的所有数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型
      titleFontSize: 0 // 指明标题的字体大小
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
  },
  computed: {
    selectTypes () {
      // 没有获取到数据就不展示标题
      if (!this.allData) {
        return []
      } else {
        // 通过filter方法过滤出不是当前选中的数据类型的数据
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 设置给标题的样式
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },
  methods: {
    initChart () {
      this.chartInstane = this.$echarts.init(this.$refs.trend_ref, 'chalk')
      const initOption = {
        // 控制整个表的位置
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          // 坐标轴的文字控制在区域内
          containLabel: true
        },
        tooltip: {
          // 鼠标移动到坐标轴上显示数据提示(展示这条轴上所有的对应数据)
          trigger: 'axis'
        },
        legend: {
          // 图例的位置
          left: 20,
          top: '15%',
          // 图例的形状
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          // 数据与起始坐标轴没有间隙
          // 注意此处配置的是category轴，而不是value轴
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstane.setOption(initOption)
    },
    async getData () {
      // await this.$http.get()
      // 对allData进行赋值
      const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      console.log(this.allData)
      this.updateChart()
    },
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      const valueArr = this.allData[this.choiceType].data
      // index主要是为了设置颜色值
      const seriesArr = valueArr.map((item, index) => {
        // 返回的数据格式[{name: '', type: '', data: []},...]
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          // 每组数据的stack值一样时形成堆叠图效果。
          stack: this.choiceType,
          // 与X轴形成包围区域，并且设置为线性渐变颜色
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                // offset颜色开始
                offset: 0,
                color: colorArr1[index]
              }, // %0的颜色值
              {
                offset: 1,
                color: colorArr2[index]
              } // 100%的颜色值
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstane.setOption(dataOption)
    },
    screenAdapter () {
      // 获取图表容器的宽度
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    // 利用下拉列表的点击事件切换当前选择的哪种类型的表
    handleSelect (currentType) {
      this.choiceType = currentType
      // 切换类型后，重新渲染图表
      this.updateChart()
      // 更改v-show的值，使得选择项不可见
      this.showChoice = false
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>
