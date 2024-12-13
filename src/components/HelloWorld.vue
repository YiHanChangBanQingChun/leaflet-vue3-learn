<template>
  <div id="app">
    <header id="header">
      <h1 id="title">Leaflet入门-1：显示底图与矢量对象</h1>
    </header>
    <div id="map"></div>
    <div id="controls">
      <select @change="switchBaseLayer" v-model="selectedLayer">
        <option value="gaode">高德地图</option>
        <!-- <option value="baidu">百度地图</option> -->
        <option value="tianditu">天地图</option>
      </select>
      <div>
        <input v-model="latitude" placeholder="纬度" />
        <input v-model="longitude" placeholder="经度" />
        <button @click="moveToLocation">移动到位置</button>
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
  name: 'App',
  data() {
    return {
      map: null,
      currentLayer: null,
      selectedLayer: 'gaode',
      latitude: '23.03776',
      longitude: '113.3687'
    };
  },
  mounted() {
    // 初始化地图
    this.map = L.map('map').setView([23.03776, 113.3687], 13);

    // 添加高德地图图层
    this.currentLayer = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      maxZoom: 18,
      minZoom: 3
    }).addTo(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Your location:', lat, lng);
          // 设置地图视图到当前位置
          this.map.setView([lat, lng], 13);

          // 添加当前位置的标记
          L.marker([lat, lng]).addTo(this.map)
            .bindPopup('你在这里').openPopup();

          // 创建一个缓冲区，半径为30米
          L.circle([lat, lng], {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.5,
            radius: 30
          }).addTo(this.map).bindPopup('当前位置的缓冲区');
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('用户拒绝了地理位置请求。');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('位置信息不可用。');
              break;
            case error.TIMEOUT:
              alert('请求超时，请重试。');
              break;
            case error.UNKNOWN_ERROR:
            default:
              alert('发生未知错误。');
              break;
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert('浏览器不支持地理定位。');
    }
    // 添加基础的地理控件
    L.control.scale().addTo(this.map);

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

    // 加载阿里云中国矢量边界数据
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(response => response.json())
      .then(data => {
        L.geoJSON(data, {
          style: {
            color: 'red',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.1
          }
        }).addTo(this.map);
      })
      .catch(error => {
        console.error('Error loading geojson data:', error);
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
    moveToLocation() {
      const lat = parseFloat(this.latitude) || 23.040076;
      const lng = parseFloat(this.longitude) || 113.362617;
      if (!isNaN(lat) && !isNaN(lng)) {
        this.map.setView([lat, lng], 13);
        L.marker([lat, lng]).addTo(this.map)
          .bindPopup('指定位置').openPopup();

        // 创建一个缓冲区，半径为30米
        L.circle([lat, lng], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5,
          radius: 30
        }).addTo(this.map).bindPopup('指定位置的缓冲区');
      } else {
        alert('请输入有效的经纬度');
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
  bottom: 10px;
  left: 50%;
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

#controls select,
#controls input,
#controls button {
  margin: 5px;
  padding: 5px;
  width: 200px;
}
</style>