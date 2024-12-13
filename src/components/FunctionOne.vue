<!-- filepath: /src/components/FunctionOne.vue -->
<template>
  <div id="app">
    <header id="header">
      <h1 id="title">Leaflet入门-2：显示热力图</h1>
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
        <h3>震点显示</h3>
          <label>
            <input type="checkbox" v-model="showPoints" @change="togglePoints" />
            地震点
          </label>
          <label>
            <input type="checkbox" v-model="showHeatmap" @change="toggleHeatmap" />
            热力图
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
import 'leaflet.heat';
import Papa from 'papaparse';

// 修复默认图标路径问题
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'FunctionOne',
  data() {
    return {
      map: null,
      currentLayer: null,
      provinceLayer: null,
      pointsLayer: null,
      heatLayer: null,
      showHeatmap: false,
      showProvinceBorder: true,
      showPoints: true,
      selectedLayer: 'gaode',
      latitude: '23.03776',
      longitude: '113.3687',
      heatmapData: []
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
          style: {
            color: 'blue', // 边界颜色
            weight: 2, // 边界宽度
            opacity: 1, // 边界透明度
            fillOpacity: 0 // 内部透明度
          }
        });
        if (this.showProvinceBorder) {
          this.provinceLayer.addTo(this.map);
        }
      });

    // 加载并显示 CSV 数据
    fetch('/data/20211129中国地震台网数据.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            this.pointsLayer = L.layerGroup();
            results.data.forEach(row => {
              const lat = parseFloat(row['纬度(°)']);
              const lng = parseFloat(row['经度(°)']);
              if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.circleMarker([lat, lng], {
                  radius: 5,
                  fillColor: "#ff7800",
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(this.pointsLayer);

                const popupContent = `
                  <table>
                    <tr><th>震级(M)</th><td>${row['震级(M)']}</td></tr>
                    <tr><th>发震时刻(UTC+8)</th><td>${row['发震时刻(UTC+8)']}</td></tr>
                    <tr><th>纬度(°)</th><td>${row['纬度(°)']}</td></tr>
                    <tr><th>经度(°)</th><td>${row['经度(°)']}</td></tr>
                    <tr><th>深度(千米)</th><td>${row['深度(千米)']}</td></tr>
                    <tr><th>参考位置</th><td>${row['参考位置']}</td></tr>
                  </table>
                `;

                marker.bindPopup(popupContent);

                // 添加到热力图数据
                this.heatmapData.push([lat, lng, 1]);
              }
            });

            if (this.showPoints) {
              this.pointsLayer.addTo(this.map);
            }

            // 初始化热力图图层
            this.heatLayer = L.heatLayer(this.heatmapData, {
            radius: 24,
            maxOpacity: 1,
            minOpacity: 0.5,
            gradient: {
                0.0: '#0000ff', // 深蓝色
                0.25: '#00ffff', // 青色
                0.5: '#00ff00', // 绿色
                0.75: '#ffff00', // 黄色
                1.0: '#ff0000' // 红色
            }
            });
            if (this.showHeatmap) {
                this.heatLayer.addTo(this.map);
            }
          }
        });
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
    toggleHeatmap() {
      if (this.showHeatmap) {
        this.heatLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.heatLayer);
      }
    },
    toggleProvinceBorder() {
      if (this.showProvinceBorder) {
        this.provinceLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.provinceLayer);
      }
    },
    togglePoints() {
      if (this.showPoints) {
        this.pointsLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.pointsLayer);
      }
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