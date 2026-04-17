<template>
    <van-dialog v-model="showDialog" transition="none" :showConfirmButton="false" :closeOnClickOverlay="false" @click-overlay="onNext">
      <div class="ad-list">
        <div v-for="(banner, idx) in bannerList" v-show="actived === idx" class="ad-item run-anim" :key="idx">
          <Advertise :banner="banner" radius="4px" />
          <div class="btn-box">
            <!-- <van-icon class="btn-close" name="clear" :class="{ active: actived === idx }" @click="onNext" /> -->
            <img class="b-img" :class="{ active: actived === idx }" src="@/assets/images/iconDeletePic.png" alt="" @click="onNext" />
          </div>
        </div>
      </div>
    </van-dialog>
  </template>
  
  <script>
  import Advertise from '@/components/Advertise'
  import { Icon } from 'vant'
  
  export default {
    name: 'AdDialog',
    components: {
      Advertise,
      [Icon.name]: Icon,
    },
    props: {
      location: {
        type: String,
        default: 'index_page_promt',
      },
    },
    data() {
      return {
        showDialog: false,
        swiperOptions: {},
        actived: 0,
      }
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      isApp() {
        return this.$store.state.isApp
      },
      bannerList() {
        if (this.$store.state.banner && this.$store.state.banner[this.location] && this.$store.state.banner[this.location].length) {
          this.showDialog = true
          return this.$store.state.banner[this.location]
        } else {
          this.onClose()
          return []
        }
      }
    },
    methods: {
      onShow() {
        this.showDialog = true
      },
      onClose() {
        this.showDialog = false
        this.$emit('closeChange')
      },
      onNext() {
        if (this.actived < this.bannerList.length - 1) {
          this.actived += 1
        } else {
          this.onClose()
        }
      },
    },
  }
  </script>
  
  <style lang="less" scoped>
  ::v-deep.van-dialog {
    background: transparent;
    border-radius: unset;
    width: 100%;
    overflow: unset;
  
    .van-dialog__content {
      margin: 0 auto;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  
      .ad-list {
        --bg-image-height: 35%;
        --content-padding-bottom: 60%;
        --aspect-ratio: 37%;
  
        position: relative;
        width: 100%;
        margin: 0 auto;
        padding: var(--bg-image-height) 0 var(--content-padding-bottom) 0;
        
        &::before {
          content: '';
          display: block;
          width: 100%;
          padding-top: var(--aspect-ratio);
          visibility: hidden;
        }
  
        .ad-item {
          width: 100%;
          padding: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
  
          .banner-item {
            width: 100%;
  
            img {
              object-fit: cover;
            }
          }
  
          .btn-box {
            text-align: center;
            padding-top: 18px;
  
            .b-img {
              width: 36px;
            }
  
            .btn-close {
              display: inline-block;
              font-size: 32px;
              color: #fff;
              cursor: pointer;
            }
          }
        }
      }
    }

    .run-anim {
        animation: scaleFade 0.2s ease-out forwards;
    }

    @keyframes scaleFade {
        from {
            opacity: 0.5;
            transform: scale(0.98);
        }

        to {
            opacity: 1;
            transform: scale(1);
        }
    }
  }
  </style>
  