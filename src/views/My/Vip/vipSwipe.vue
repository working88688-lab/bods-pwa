<template>
  <swiper
    ref="vipSwiper"
    class="vip-swiper"
    :options="swiperOptions"
    v-if="vipLevels.length"
  >
    <swiper-slide
      v-for="(vip, idx) in vipLevels"
      :key="idx"
      class="vip-item"
      style="background: transparent"
    >
      <img
        class="top-img"
        :src="imageBase + vip.vipImgUrl"
      />
      <div class="price">
        <div class="discount">
          <span>￥</span>
          {{ vip.discountPrice }}
        </div>
        <div class="original">原价：￥{{ vip.originalPrice }}</div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script>
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import 'swiper/css/swiper.css'
  import { getVipSetWithPayType } from '@/apis/user'

  export default {
    name: 'VipSwipe',
    components: {
      Swiper,
      SwiperSlide,
    },
    props: {
      active: {
        type: Number,
        default: 0,
      },
      isDetail: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      const _this = this
      return {
        swiperOptions: {
          slidesPerView: 'auto',
          spaceBetween: 6,
          centeredSlides: true,
          touchMoveStopPropagation: true,
          initialSlide: 0,
          loop: true,
          on: {
            slideChange: function () {
              _this.$emit('onInited', _this.vipLevels[this.realIndex])
            },
          },
        },
        vipLevels: [],
        activeIndex: 0,
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
      this.getVipLevels()
    },
    activated() {},
    methods: {
      async getVipLevels() {
        const res = await getVipSetWithPayType({})
        if (res && res.code === 0) {
          res.data.forEach((item, index) => {
            if (item.vipCode === this.$route.query.vipCode) {
              this.swiperOptions.initialSlide = index
              this.activeIndex = index
            }
          })
          this.vipLevels = res.data.map(item => ({
            ...item,
            payTypeVoList: item.payTypeVoList
              ? [
                  ...item.payTypeVoList.map(item => ({
                    ...item,
                    imgUrl: this.imageBase + item.imgUrl,
                  })),
                ]
              : item.payTypeVoList,
          }))
          const targetData = this.vipLevels[this.activeIndex]
          this.$emit('onInited', targetData)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .vip-swiper {
    padding: 16px 0;
    color: #fff;
    .swiper-wrapper {
      display: flex;
      justify-content: center;
      .swiper-slide {
        cursor: pointer;
        width: 40%; /* 使用计算后的宽度 */
        //   aspect-ratio: 69 / 97;
        background-size: 100% 100%;
        transform: scale(0.8);
        transition: transform 300ms ease-in-out;
        background: transparent;
        position: relative;
        box-sizing: border-box;
        img {
          width: 100%;
          height: 100%;
          vertical-align: middle;
          border: none;
        }
        .price {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          position: absolute;
          bottom: 16px;
          right: 24px;

          .discount {
            font-size: 20px;
            font-weight: bold;
            white-space: nowrap;

            span {
              font-size: 12px;
              margin-right: -3px;
            }
          }

          .original {
            margin-top: 4px;
            font-size: 12px;
            text-decoration: line-through;
            white-space: nowrap;
          }
        }
      }
      .swiper-slide-active {
        transform: scale(1);
      }
    }
  }
</style>
