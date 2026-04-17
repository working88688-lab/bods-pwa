<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '50%', background: '#1c1c1c' }"
    :closeable="true"
  >
    <div class="popup-title">
      <div>全部筛选</div>
    </div>
    <div class="popup-content">
      <div class="search-section">
        <div class="search-label">类别</div>
        <div class="search-list">
          <div
            class="search-item"
            v-for="(broadcastGender, i) in broadcastGenderList"
            :key="i"
            @click="onSelect(broadcastGender, 'broadcastGender')"
            :class="{
              selected: filter.broadcastGender === broadcastGender.value,
            }"
          >
            {{ broadcastGender.text }}
          </div>
        </div>
      </div>
      <div class="search-section">
        <div class="search-label">状态</div>
        <div class="search-list">
          <div
            class="search-item"
            v-for="(liveStatus, i) in liveStatusList"
            :key="i"
            @click="onSelect(liveStatus, 'isLive')"
            :class="{ selected: filter.isLive === liveStatus.value }"
          >
            {{ liveStatus.text }}
          </div>
        </div>
      </div>
    </div>
    <div class="btn-box">
      <van-button round class="mr-24" @click="onReset">重置</van-button>
      <van-button round type="primary" @click="onFinish">完成</van-button>
    </div>
  </van-popup>
</template>

<script>
import { listAllType } from '@/apis/media'
import _ from 'lodash'

export default {
  name: 'SearchPopup',
  props: {
    searchData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      show: false,
      broadcastGenderList: [
        { text: '全部', value: '' },
        { text: '男性', value: 'male' },
        { text: '女性', value: 'female' },
        { text: '变性人', value: 'tranny' },
        { text: '群体表演', value: 'group' },
        { text: '情侣', value: 'couple' },
      ],
      liveStatusList: [
        { text: '在线', value: 1 },
        { text: '离线', value: 0 },
      ],
      filter: {
        broadcastGender: '',
        isLive: 1,
      },
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    device() {
      return this.$store.state.device
    },
  },
  created() {},
  mounted() {},
  methods: {
    onShow() {
      this.show = true
      this.filter.broadcastGender = this.searchData.broadcastGender
      this.filter.isLive = this.searchData.isLive
    },
    onClose() {
      this.show = false
    },
    onReset() {
      this.filter = {
        broadcastGender: '',
        isLive: 1,
      }
      this.onFinish()
    },
    onSelect(data, key) {
      this.filter[key] = data.value
    },
    onFinish() {
      this.$emit('onFinish', this.filter)
      this.onClose()
    },
  },
}
</script>

<style lang="less" scoped>
.popup-title {
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 16px;
  color: #f8f8f8;
  font-weight: bold;
}
.popup-content {
  padding: 12px;
  height: calc(100% - 116px);
  overflow-y: auto;
  .search-section {
    margin-bottom: 24px;
    .search-label {
      font-size: 15px;
      font-weight: bold;
      color: #f8f8f8;
      margin-bottom: 10px;
    }
    .search-list {
      overflow: hidden;
      .search-item {
        width: calc((100% - 20px) / 3);
        height: 38px;
        line-height: 38px;
        text-align: center;
        background: #26252e;
        font-size: 13px;
        color: #f8f8f8;
        border-radius: 19px;
        float: left;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
      }
      .search-item:nth-child(3n) {
        margin-right: 0;
      }
      .selected {
        background: #109fff;
      }
    }
  }
  .search-section:last-child {
    margin-bottom: 0;
  }
}
.btn-box {
  padding: 12px;
  .van-button {
    width: calc((100% - 24px) / 2);
  }
  .van-button--default {
    color: #000;
    background: #f6f6f6;
  }
}
</style>
