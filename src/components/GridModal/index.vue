<template>
    <van-dialog v-model="show" :overlay-style="{ 'background': 'rgba(0, 0, 0, .86)' }" :showConfirmButton="false"
      @click-overlay="close">
      <div class="grid-main">
        <div class="g-box">
          <div class="grid">
            <div v-for="item in list" :key="item.bannerCode">
              <Advertise :banner="item" radius="4px" />
              <div class="item-title">{{ item.bannerName }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn">
        <img src="@/assets/images/iconDeletePic.png" alt="" @click.stop="close" />
      </div>
    </van-dialog>
  </template>
  
  <script>
  import Advertise from '@/components/Advertise'
  
  export default {
    name: 'GridModal',
    components: { Advertise },
    data() {
      return {
        show: false,
      }
    },
    computed: {
      list() {
        if (
          this.$store.state.banner &&
          this.$store.state.banner['appicon_9'] && this.$store.state.banner['appicon_9'].length
        ) {
          this.show = true
          return this.$store.state.banner['appicon_9']
        } else {
          this.close()
          return []
        }
      },
    },
    methods: {
      close() {
        this.show = false
        this.$emit('closeChange')
      },
    },
  }
  </script>
  
  <style scoped lang="less">
  ::v-deep.van-dialog {
    background: transparent;
    border-radius: unset;
    width: 100%;
    overflow: unset;
    font-size: 12px;
    color: #000;
  
    .van-dialog__content {
      margin: 0 auto;
      width: 100%;
      height: 100%;
      position: relative;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
  
      .grid-main {
        --bg-image-height: 28%;
        --content-padding-bottom: 60%;
        --aspect-ratio: 30%;
  
        position: relative;
        width: 100%;
        margin: 0 auto;
        background: url('../../assets/images/grid_bg_1.png') no-repeat top;
        background-size: 100%;
        padding: var(--bg-image-height) 0 var(--content-padding-bottom) 0;
        border-bottom-left-radius: 30px;
        border-bottom-right-radius: 30px;
        
        &::before {
          content: '';
          display: block;
          width: 100%;
          padding-top: var(--aspect-ratio);
          visibility: hidden;
        }
  
        .g-box {
          position: absolute;
          top: var(--bg-image-height);
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0 8px 16px 8px;
          overflow-y: auto;
  
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      }
  
      .grid {
        display: flex;
        flex-wrap: wrap;
        padding: 0 8px 0 8px;
        border-radius: 10px;
        overflow-y: scroll;
        overflow-x: hidden;
        max-height: 100%;
  
        .item-title {
          height: 17px;
          line-height: 17px;
          border-radius: 4px;
          font-size: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
  
        &>div {
          text-align: center;
          width: calc((100% - 32px) / 5);
          margin-right: 8px;
          margin-bottom: 10px;
  
          &:nth-of-type(5n) {
            margin-right: 0;
          }
  
          img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: contain;
            border-radius: 10px;
            background: #fff;
          }
        }
      }
  
      .btn {
        text-align: center;
        margin-top: 30px;
  
        img {
          width: 36px;
        }
      }
    }
  }
  </style>