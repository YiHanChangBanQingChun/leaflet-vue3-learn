<!-- filepath: /src/components/FunctionTwo.vue -->
<template>
  <div id="app">
    <header id="header">
      <h1 id="title">Leaflet入门-3：显示健康指数</h1>
    </header>
    <div id="map"></div>
    <div id="controls">
      <div class="layer-control">
        <div>
          <h3>图层控制</h3>
          <label>
            <input type="radio" value="gaode" v-model="selectedLayer" @change="switchBaseLayer" />
            高德地图
          </label>
          <label>
            <input type="radio" value="tianditu" v-model="selectedLayer" @change="switchBaseLayer" />
            天地图
          </label>
        </div>
        <div>
          <h3>边界显示</h3>
          <label>
            <input type="checkbox" v-model="showProvinceBorder" @change="toggleProvinceBorder" />
            省份边界
          </label>
        </div>
        <div>
          <h3>健康指数显示</h3>
          <label>
            <input type="checkbox" v-model="showHealthIndex" @change="toggleHealthIndex" />
            健康指数
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// 修复默认图标路径问题
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'FunctionTwo',
  data() {
    return {
      map: null,
      currentLayer: null,
      provinceLayer: null,
      showProvinceBorder: true,
      showHealthIndex: true,
      selectedLayer: 'gaode',
      latitude: '23.03776',
      longitude: '113.3687',
      healthList: {
        '北京': 86.33, '上海': 81.84, '天津': 62.73, '海南': 51.43, '浙江': 49.42, '山东': 48.91,
        '广东': 47.47, '江苏': 45, '重庆': 44.64, '福建': 40.39, '贵州': 38.4, '四川': 36.74, '安徽': 36.52, '广西': 34.95, '江西': 33.77,
        '湖北': 31.56, '宁夏': 28.82, '湖南': 28.03, '辽宁': 27.7, '山西': 25.73, '内蒙古': 25.27, '陕西': 23.95, '西藏': 23.94, '甘肃': 22.56, '新疆': 21.99,
        '青海': 21.69, '河北': 21.39, '吉林': 21.16, '黑龙江': 21.08, '河南': 20.49, '云南': 19.17
      }
    };
  },
  mounted() {
    // 初始化地图
    this.map = L.map('map').setView([23.03776, 113.3687], 3);

    // 添加高德地图图层
    this.currentLayer = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      maxZoom: 18,
      minZoom: 3
    }).addTo(this.map);

    // 添加基础的地理控件
    L.control.scale().addTo(this.map);

    // 加载并显示 GeoJSON 数据
    fetch('/data/province.geojson')
      .then(response => response.json())
      .then(geojsonData => {
        this.provinceLayer = L.geoJSON(geojsonData, {
          style: this.styleFeature,
          onEachFeature: this.onEachFeature
        }).addTo(this.map);
      });

    // 添加测量工具
    const drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: 'purple'
          }
        },
        polyline: {
          shapeOptions: {
            color: 'red'
          },
          metric: true, // 使用公制单位
          feet: false, // 不使用英尺单位
          nautic: false // 不使用海里单位
        },
        rectangle: {
          shapeOptions: {
            color: 'green'
          }
        },
        circle: {
          shapeOptions: {
            color: 'steelblue'
          }
        },
        marker: true
      }
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);
    });

    this.map.on(L.Draw.Event.EDITED, (event) => {
      const layers = event.layers;
      layers.eachLayer((/* layer */) => {
        // 处理编辑后的图层
      });
    });

    this.map.on(L.Draw.Event.DELETED, (event) => {
      const layers = event.layers;
      layers.eachLayer((/* layer */) => {
        // 处理删除后的图层
      });
    });
  },
  methods: {
    switchBaseLayer() {
      if (this.currentLayer) {
        this.map.removeLayer(this.currentLayer);
      }
      if (this.selectedLayer === 'gaode') {
        this.currentLayer = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
          subdomains: '1234',
          maxZoom: 18,
          minZoom: 3
        }).addTo(this.map);
      } else if (this.selectedLayer === 'tianditu') {
        this.currentLayer = L.tileLayer('http://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=7485646a0cb145ca159e71d2fb2417d3', {
          subdomains: '0 1 2 3 4 5 6 7',
          maxZoom: 18,
          minZoom: 3
        }).addTo(this.map);
      }
    },
    toggleProvinceBorder() {
      if (this.showProvinceBorder) {
        this.provinceLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.provinceLayer);
      }
    },
    toggleHealthIndex() {
      if (this.showHealthIndex) {
        this.provinceLayer.setStyle(this.styleFeature);
      } else {
        this.provinceLayer.setStyle({ fillColor: 'transparent' });
      }
    },
    getColor(d) {
      return d > 80 ? '#800026' :
             d > 70 ? '#BD0026' :
             d > 60 ? '#E31A1C' :
             d > 50 ? '#FC4E2A' :
             d > 40 ? '#FD8D3C' :
             d > 30 ? '#FEB24C' :
             d > 20 ? '#FED976' :
                      '#FFEDA0';
    },
    styleFeature(feature) {
      return {
        fillColor: this.showHealthIndex ? this.getColor(this.healthList[feature.properties.name]) : 'transparent',
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
      };
    },
    onEachFeature(feature, layer) {
      layer.on({
        // eslint-disable-next-line no-unused-vars
        click: (e) => {
          const healthIndex = this.healthList[feature.properties.name];
          layer.bindPopup(`${feature.properties.name} 健康指数: ${healthIndex}`).openPopup();
        }
      });
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

#header {
  background: white;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  width: 50%;
  transform: translateX(-50%);
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  left: 50%;
}

#title {
  margin: 0;
}

#map {
  flex: 1;
}

#controls {
  position: fixed;
  bottom: 5%;
  left: 90%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layer-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.layer-control h3 {
  margin: 0 0 10px 0;
  width: 100%;
  text-align: left;
}

.layer-control label {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  width: 100%;
}

.layer-control input[type="radio"],
.layer-control input[type="checkbox"] {
  margin-right: 5px;
}
</style>