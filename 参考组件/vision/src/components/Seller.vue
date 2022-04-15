<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
    <h1>hahahah1</h1>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据，得到的data，后续需要处理使用，记得开后端服务器
      currentPage: 1, // 当前显示的页数,通过定时器更改当前显示的页数
      totalPage: 0, // 一共有多少页
      timerId: null // 定时器的标识
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配
    this.screenAdapter()
  },
  destroyed () {
    // 页面销毁的时候取消定时器
    clearInterval(this.timerId)
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化echartInstance对象
    // 初始化的时候并没有加载数据，只是加载了一些样式配置
    // 后面载使用updateChart增量配置的方式更新数据
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, 'chalk')
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          // 标题的配置
          text: '▎商家销售统计',
          left: 20,
          top: 20
        },
        // 控制图表的位置，直角坐标系的通用配置
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 以上距离设置包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              // 文字的位置，默认中间
              position: 'right',
              // 文字的颜色
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 百分之0状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE'
                },
                // 百分之100状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        // 鼠标移动到图表上代表用户想要查看数据，此时需要清除定时器
        // 取消当前正在运行的定时器，不再更新页面数量
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
      // 鼠标移除，再次启动定时器，3000ms增加一页
        this.startInterval()
      })
    },
    // 获取服务器的数据
    async getData () {
      // http://127.0.0.1:8888/api/seller
      // ES6数据解析
      const { data: ret } = await this.$http.get('seller')
      console.log(ret)
      this.allData = ret
      // 对数据排序
      this.allData.sort((a, b) => {
        return a.value - b.value // 从小到大的排序
        // return b.value - a.value // 从大到小的排序
      })
      // 每5个元素显示一页，不能整除就加1页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      // 第一次启动定时器
      this.startInterval()
    },
    // 更新图表
    updateChart () {
      // 更新数据
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      // slice方法截取数组的数据。slice方法包含start，不包含end
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      // 获取表格中的数据的值
      const sellerValues = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      // 增量更新
      this.chartInstance.setOption(dataOption)
    },
    // 通过
    startInterval () {
      if (this.timerId) {
        // 内置方法取消已经定时器
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        // 当前页数加1
        this.currentPage++
        // 展示到最后一页的时候重置为第一页
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        // 更改了也数之后立即更新图表数据
        this.updateChart()
      }, 3000)
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.seller_ref.offsetWidth)
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
