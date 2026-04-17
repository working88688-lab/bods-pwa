<template>
  <div class="darknet">
    <Advertise
      :banner="tip"
      class="tip"
      radius="0"
      v-if="show"
    />
    <Movie
      route="/darknet"
      v-else
    />
  </div>
</template>

<script>
  import { Dialog } from 'vant'
  import Advertise from '@/components/Advertise'
  import Movie from '../Movie'
  export default {
    components: { Dialog, Advertise, Movie },
    data() {
      return {}
    },
    computed: {
      show: {
        get() {
          return this.$store.state.darkShow
        },
        set() {},
      },
      tip() {
        if (
          this.$store.state.banner &&
          this.$store.state.banner['darknet_tips'] &&
          this.$store.state.banner['darknet_tips'].length
        ) {
          return this.$store.state.banner['darknet_tips'][0]
        } else {
          return null
        }
      },
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
    },
    methods: {
      clicktip() {
        Dialog.confirm({
          title: '标题',
          message: '弹窗内容',
          className: 'tip-dialog',
        })
          .then(() => {
            // on confirm
          })
          .catch(() => {
            // on cancel
          })
      },
    },
  }
</script>

<style scoped lang="less">
  .darknet {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top: var(--safe-area-top);

    .tip {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      ::v-deep img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 0;
      }
    }
  }
</style>
