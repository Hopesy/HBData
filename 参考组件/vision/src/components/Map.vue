<!-- 商家分布图表 -->
<template>
  <div class='com-container' @dblclick="revertMap">
    <div class='com-chart' ref='map_ref'></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      mapData: {} // 所获取的省份的地图矢量数据
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
  methods: {
    async initChart () {
      // 初始化图表,使用此主题可以使图表背景颜色改变，并且具有圆角效果
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, 'chalk')
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于KOA2的后台, 所以咱们不能使用this.$http
      // 因此借助于axios模块(npm install)的get方法获取json数据
      const ret = await axios.get('http://localhost:9000/static/map/china.json')
      // 一定要注意注册地图矢量数据的时候, 注册的名字必须和地图矢量数据的名字一致
      this.$echarts.registerMap('china', ret.data)
      const initOption = {
        title: {
          text: '▎ 商家分布',
          left: 20,
          top: 20
        },
        // 注册之后就会显示地图，此时默认鼠标移动到地图上某个省份会有提示，点击会显示信息
        geo: {
          // type`map`
          type: 'map',
          // 名字保持一致
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            // 图形颜色和边框
            areaColor: '#2E72BF',
            borderColor: '#333'
          }
        },
        legend: {
          // 定位图例的位置在左下角
          left: '5%',
          bottom: '5%',
          // 图例垂直分布
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async arg => {
        // arg.name 得到所点击的省份, 这个省份他是中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        console.log(provinceInfo)
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get('http://localhost:9000' + provinceInfo.path)
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    async getData () {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      const { data: ret } = await this.$http.get('map')
      this.allData = ret
      console.log(this.allData)
      this.updateChart()
    },
    updateChart () {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        return {
          // 散点圆圈的涟漪效果
          type: 'effectScatter',
          // 控制涟漪效果
          rippleEffect: {
            // 涟漪程度
            scale: 5,
            // 空心涟漪效果
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      // 通过增量更新option的方式来更新图表，在地图的基础上增加一个散点图
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      // 字体的适配，先通过图表容器的宽度测试出合适的字体大小
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      // 更新之后一定不要忘记重新设置图表大小
      // 图表之所以会自适应，是因为我们容器宽度设置的是一个比例
      this.chartInstance.resize()
    },
    // 回到中国地图
    revertMap () {
      const revertOption = {
        // map的名称修改就足够了
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style lang='less' scoped>
</style>
