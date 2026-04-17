<template>
  <div class="page-container flex-container ai">
    <Header
      textColor="#000"
      rightColor="#000"
      color="transparent"
      title="AI科技,让您创造想象"
      :showLeft="true"
      :isBlur="false"
      right="历史记录"
      @onClickLeft="goback"
      @onClickRight="onRoute('/aiRecord')"
    />
    <van-tabs
      v-model="activedTab"
      :ellipsis="false"
      animated
      lazy-render
      class="page-tabs flex-container"
      title-inactive-color="#000"
    >
      <van-tab
        v-for="(tab, idx) in tabList"
        :key="idx"
        :title="tab.label"
        :name="tab.value"
      >
        <AINude v-if="tab.value === 0" />
        <AIFaceVideo v-else-if="tab.value === 1" @onSelected="handleSelected" />
        <AIFaceImg v-else-if="tab.value === 2" @onSelected="handleSelected" />
      </van-tab>
    </van-tabs>
    <CreatorPopUp ref="CreatorPopUpRef" @previewVideo="handlePreviewVideo" />
    <FullScreenPlayerDialog
      v-if="showPlayerDialog"
      :id="videoCode"
      :videoUrl="videoUrl"
      @closePlay="handleClosePlay"
    />
    <van-dialog
      v-model:show="showDialog"
      class="operate-dialog"
      :showConfirmButton="false"
      :closeOnClickOverlay="true"
      @close="onClose"
    >
      <div class="content">
        <div class="title">请选择一张人脸清晰的照片</div>
        <div class="img-list">
          <div class="img-item">
            <img src="@/assets/images/sample3.png" alt="" />
            <div>正脸无遮挡</div>
          </div>
          <div class="img-item">
            <img src="@/assets/images/sample2.png" alt="" />
            <div>不遮挡额头</div>
          </div>
          <div class="img-item">
            <img src="@/assets/images/sample1.png" alt="" />
            <div>不遮挡眼睛</div>
          </div>
        </div>
        <div class="title">注意事项说明</div>
        <div class="rule-list">
          <div class="rule-item">
            1.官方承诺素材图片仅供AI功能合成使用，合成后的内容仅用户可见，在您下载保存后，即可到历史记录中进行清除。
          </div>
          <div class="rule-item">
            2.素材图片应像素清晰、光线充足，不得大于2mb，上传间隔为60秒。
          </div>
          <div class="rule-item">3.本功能不支持多人图片。</div>
          <div class="rule-item">4.禁止上传未成年人图片，否则永久封号！</div>
        </div>
        <div class="dialog-btn-box">
          <van-button round block type="primary" @click="onClose"
            >确定</van-button
          >
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getUserAiFreeTimes, uploadImg, submitAiPicture } from '@/apis/ai'
import { Dialog } from 'vant'
import AINude from './AINude'
import AIFaceVideo from './AIFaceVideo'
import AIFaceImg from './AIFaceImg'
import CreatorPopUp from './CreatorPopUp'
import FullScreenPlayerDialog from './FullScreenPlayerDialog'

export default {
  name: 'AI',
  components: {
    Header,
    Loading,
    AINude,
    AIFaceVideo,
    AIFaceImg,
    CreatorPopUp,
    FullScreenPlayerDialog,
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return {
      activedTab: 0,
      tabList: [
        {
          label: 'AI脱衣',
          icon: require('../../assets/images/ai_tf.png'),
          actived: require('../../assets/images/ai_tf_actived.png'),
          value: 0,
        },
        {
          label: 'AI视频换脸',
          icon: require('../../assets/images/ai_video.png'),
          actived: require('../../assets/images/ai_video_actived.png'),
          value: 1,
        },
        {
          label: 'AI图片换脸',
          icon: require('../../assets/images/ai_img.png'),
          actived: require('../../assets/images/ai_img_actived.png'),
          value: 2,
        },
      ],
      showPlayerDialog: false,
      videoCode: null,
      videoUrl: null,
      showDialog: true,
    }
  },
  created() {},
  mounted() {},
  methods: {
    goback() {
      this.$router.go(-1)
    },
    onRoute(path) {
      this.$router.push(path)
    },
    handleSelected(data) {
      this.$refs.CreatorPopUpRef.onShow(data)
    },
    handlePreviewVideo(data) {
      this.videoUrl = this.imageBase + data.aiVideoUrl
      this.videoCode = data.confCode
      this.showPlayerDialog = true
    },
    handleClosePlay() {
      this.showPlayerDialog = false
      this.videoUrl = null
      this.videoCode = null
    },
    onClose() {
      this.showDialog = false
    },
  },
}
</script>

<style lang="less" scoped>
.ai {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
::v-deep .page-tabs {
  position: relative;
  > .van-tabs__wrap {
    > .van-tabs__nav {
      width: 100%;
      padding: 0;
      justify-content: center;
      .nav-right {
        margin-left: auto;
        margin-right: 16px;
        height: 44px;
        line-height: 44px;
        color: #111;
      }
    }
  }
  > .van-tabs__content {
    flex: 1;
    overflow: hidden;
    > .van-tabs__track {
      height: 100%;
      > .van-tab__pane-wrapper {
        height: 100%;
        > .van-tab__pane {
          height: 100%;
        }
      }
    }
  }
}
.page-top {
  .tab-list {
    padding-bottom: 12px;
    display: flex;
    justify-content: space-around;

    .tab-item {
      text-align: center;
      background: #fff;
      color: #ff3271;
      padding: 8px 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      border-radius: 8px;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .actived {
      background: #ff3271;
      color: #fff;
    }
  }
}

.content-swipe {
  flex: 1;
  overflow: hidden;

  .van-swipe__track {
    flex: 1;
    overflow-y: hidden;
  }
}

::v-deep .operate-dialog {
  background: linear-gradient(to bottom, rgb(255 201 217), #fff);
  padding: 24px;

  .title {
    margin: 24px 0 16px;
    text-align: center;
  }

  .img-list {
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-size: 12px;
    color: rgb(34 34 34);

    .img-item {
      img {
        width: 60px;
      }
    }
  }

  .rule-list {
    .rule-item {
      font-size: 12px;
      color: rgb(34 34 34);
      line-height: 1.5;
      margin-bottom: 6px;
    }
  }

  .dialog-btn-box {
    margin-top: 24px;
  }
}
</style>
