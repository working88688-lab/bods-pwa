<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    :get-container="getContainer"
    round
    :style="{ height: '80%', background: '#fff' }"
    :closeable="true"
    :safe-area-inset-bottom="true"
    class="flex-container"
  >
    <div class="popup-title">
      <div>全部筛选</div>
    </div>
    <div class="popup-content">
      <div
        class="search-section"
        v-for="(searchItem, idx) in allSearchList"
        :key="idx"
      >
        <div class="search-label">{{ searchItem.name }}</div>
        <div class="search-list">
          <div
            class="search-item"
            v-for="(item, i) in searchItem.itemList"
            :key="i"
            @click="onSelect(idx, i)"
            :class="{ selected: item.selecte }"
          >
            {{ item.name }}
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
  name: 'NudeChatSearchPopup',
  data() {
    return {
      show: false,
      allSearchList: [],
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {
    this.getListAllType()
  },
  mounted() {},
  methods: {
    getContainer() {
      return document.getElementById('app')
    },
    onShow() {
      this.show = true
    },
    onClose() {
      this.show = false
    },
    onReset() {
      this.formatTypeList(this.allSearchList)
    },
    onSelect(m, n) {
      const targetData = this.allSearchList[m]
      if (targetData.name === '城市') {
        targetData.itemList.forEach((one, idx) => {
          if (idx === n) {
            targetData.itemList[idx].selecte = !targetData.itemList[n].selecte
          } else {
            targetData.itemList[idx].selecte = false
          }
        })
      } else {
        targetData.itemList[n].selecte = !targetData.itemList[n].selecte
      }
      this.$set(this.allSearchList, m, targetData)
    },
    onFinish() {
      this.$emit('onFinish', this.allSearchList)
      this.onClose()
    },
    async getListAllType() {
      const res = await listAllType({})
      if (res && res.code === 0) {
        this.allSearchList = this.formatTypeList(res.data)
      }
    },
    formatTypeList(data) {
      const typeList = [].concat(data)
      typeList.forEach((one, m) => {
        typeList[m]['selecte'] = false
        one.itemList.forEach((two, n) => {
          typeList[m].itemList[n]['selecte'] = false
        })
      })
      return typeList
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
  font-weight: bold;
}

.popup-content {
  padding: 12px;
  flex: 1;
  overflow: auto;

  .search-section {
    margin-bottom: 24px;

    .search-label {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .search-list {
      overflow: hidden;

      .search-item {
        width: calc((100% - 20px) / 3);
        padding: 10px 5px;
        text-align: center;
        background: #f6f6f6;
        font-size: 13px;
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
        color: #fff;
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
    color: #109fff;
    background: none;
    border: 1px solid #109fff;
  }
}
</style>
