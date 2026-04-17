<template>
  <van-popup
    style="width: 100%; height: 100%"
    class="van-safe-area-top editPopup bg-page"
    v-model="show"
    v-if="show"
  >
    <Header
      textColor="#222222"
      :title="item.label"
      @onClickLeft="close"
    />
    <van-form
      @submit="onSubmit"
      class="mt-3"
    >
      <van-cell-group
        inset
        class="mx-3"
      >
        <template v-if="item.value === 'avatar'">
          <van-field
            name="uploader"
            label="头像上传"
          >
            <template #input>
              <van-uploader
                v-model="headFileList"
                :max-count="1"
                accept="image/*"
                :after-read="afterRead"
              />
            </template>
          </van-field>
        </template>

        <template v-else-if="item.value === 'nickName'">
          <van-field
            v-model="formParams.nickName"
            placeholder="请输入昵称"
            clearable
          />
        </template>

        <template v-else-if="item.value === 'sign'">
          <van-field
            v-model="formParams.signature"
            rows="4"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="请输入签名"
            show-word-limit
            clearable
          />
        </template>

        <template v-else-if="item.value === 'invite'">
          <van-field
            v-model="formParams.code"
            placeholder="请输入邀请码"
            clearable
          />
        </template>

        <template v-else-if="item.value === 'phone' || item.value === 'change'">
          <van-field
            v-model="formParams.mobile"
            name="mobile"
            placeholder="请填写手机号"
          />
          <van-field
            v-model="formParams.code"
            placeholder="请输入验证码"
            clearable
            center
          >
            <template #button>
              <van-button
                size="small"
                plain
                type="primary"
                class="send"
                :disabled="countdowning"
                :loading="sending"
                @click="handleSend"
                loading-text="发送中..."
                native-type="button"
              >
                {{ countdowning ? `${sendText}秒后再次发送` : sendText }}
              </van-button>
            </template>
          </van-field>
        </template>

        <template v-else>
          <van-field
            name="uploader"
            label="凭证上传"
          >
            <template #input>
              <van-uploader
                :max-count="1"
                accept="image/*"
                :after-read="decoding"
              />
            </template>
          </van-field>
        </template>
      </van-cell-group>
      <div
        v-if="item.value === 'invite'"
        style="font-size: 14px; padding: 4px 12px"
      >
        只能绑定一次，绑定后不允许修改，请核对输入是否正确
      </div>
      <div style="margin: 30px 16px">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="提交中..."
        >
          提交
        </van-button>
      </div>
    </van-form>
  </van-popup>
</template>

<script>
  import Header from '@/components/Header'
  import {
    changeHeadImg,
    uploadFile,
    changeNickName,
    changeSignature,
    bingInviteCode,
    sendCodePhone,
    bindPhone,
    loginPhone,
    useQrFindOldAccount,
    getDeviceId,
  } from '@/apis/user'
  import jsqr from 'jsqr'
  import md5 from 'md5'
  import { encrypt } from '@/utils/rsa'

  export default {
    components: { Header },
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        show: false,
        formParams: {
          headUrl: null, // 头像
          signature: null, // 签名
          nickName: null, // 昵称
          code: null, // 邀请码
          mobile: null, // 手机号
        },
        timer: null,
        headFileList: [],
        loading: false,
        countdowning: false,
        sending: false,
        sendText: '获取验证码',
      }
    },
    computed: {
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      userInfo() {
        return this.$store.state.userInfo
      },
    },
    methods: {
      open() {
        this.show = true
      },
      close() {
        this.show = false
      },
      async afterRead(file) {
        file.status = 'uploading'
        file.message = '上传中...'
        const formData = new FormData()
        formData.append('file', file.file)
        try {
          const res = await uploadFile(formData)
          if (res && res.code === 0) {
            file.status = 'done'
            file.message = '上传成功'
            this.formParams.headUrl = res.data.url
            this.$toast('上传成功')
          }
        } catch (error) {
          file.status = 'failed'
          file.message = '上传失败'
          this.$toast('上传失败')
          throw error
        }
      },
      countdown() {
        this.sendText = 60
        this.countdowning = true
        this.timer = setInterval(() => {
          if (typeof this.sendText === 'number' && this.sendText > 0) {
            this.sendText--
          } else {
            this.sendText = '获取验证码'
            clearInterval(this.timer)
            this.countdowning = false
          }
        }, 1000)
      },
      async handleSend() {
        const regex = /^1[3-9]\d{9}$/
        try {
          if (regex.test(this.formParams.mobile)) {
            this.sending = true
            const res = await sendCodePhone({ mobile: this.formParams.mobile })
            if (res && res.code === 0) {
              this.countdown()
            } else {
              this.$toast(res.msg)
            }
          } else {
            this.$toast('请输入正确的手机号')
          }
        } catch (error) {
          throw error
        } finally {
          this.sending = false
        }
      },
      async useDeviceId() {
        try {
          const res = await getDeviceId({})
          if (res && res.code === 0) {
            this.$store.commit('SET_USERINFO', res.data)
            this.$store.commit('SET_UUID', res.data)
            this.$router.replace('/mine')
          } else {
            this.$toast(res.msg)
          }
        } catch (error) {
          throw error
        }
      },
      async decoding({ file }) {
        const reader = new FileReader()
        reader.onload = event => {
          const img = new Image()
          img.onload = async () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            // 使用二维码解码库进行二维码识别
            const code = jsqr(imageData.data, canvas.width, canvas.height)
            if (code && code.data) {
              const link = new URL(code.data)
              const search = new URLSearchParams(link.search)
              const uuid = search.get('uuid')
              if (uuid) {
                const inviteCode = search.get('inviteCode') || ''
                const params = {
                  merchantAcct: process.env.VUE_APP_MERCHANTACCT,
                  mac: uuid,
                  os: this.$store.state.isApp ? 0 : 2,
                  tips: md5(process.env.VUE_APP_MERCHANTACCT + uuid + (this.$store.state.isApp ? 0 : 2)),
                  inviteCode,
                }
                const response = await useQrFindOldAccount({
                  encrypt: encrypt(JSON.stringify(params)),
                })
                if (response && response.code === 0) {
                  const { token, infoPo } = response.data
                  this.$store.commit('SET_TOKEN', token)
                  this.$store.commit('SET_USERINFO', infoPo)
                  inviteCode && this.$store.commit('SET_INVITECODE', inviteCode)
                  this.useDeviceId()
                }
              }
            } else {
              return this.$toast('未识别到二维码，请重新上传')
            }
          }
          img.src = event.target.result
        }
        reader.readAsDataURL(file)
      },
      async onSubmit() {
        this.loading = true
        let res
        try {
          switch (this.item.value) {
            case 'avatar':
              res = await changeHeadImg({
                headUrl: this.formParams.headUrl,
              })
              break
            case 'nickName':
              res = await changeNickName({
                nickName: this.formParams.nickName,
              })
              break
            case 'sign':
              res = await changeSignature({
                signature: this.formParams.signature,
              })
              break
            case 'invite':
              res = await bingInviteCode({
                code: this.formParams.code,
              })
              break
            case 'phone':
              if (this.formParams.mobile && this.formParams.code) {
                res = await bindPhone({
                  mobile: this.formParams.mobile,
                  code: this.formParams.code,
                })
              } else {
                this.$toast('手机号和验证码不能为空')
              }
              break
            case 'change':
              if (this.formParams.mobile && this.formParams.code) {
                res = await loginPhone({
                  mobile: this.formParams.mobile,
                  code: this.formParams.code,
                })
              } else {
                this.$toast('手机号和验证码不能为空')
              }
              break
            case 'retrieve':
              break

            default:
              break
          }
          if (res && res.code === 0) {
            if (this.item.value === 'phone') {
              this.$toast('绑定成功')
            } else if (this.item.value === 'change') {
              const { token, infoPo } = res.data
              this.$store.commit('SET_TOKEN', token)
              this.$store.commit('SET_USERINFO', infoPo)
              this.useDeviceId()
            } else {
              this.$toast('提交成功，请等待审核')
            }
          } else {
            this.$toast(res.msg)
          }
        } catch (error) {
        } finally {
          this.loading = false
        }
      },
    },
    created() {
      this.headFileList = [{ url: this.imageBase + this.userInfo.headUrl, isImage: true }]
      this.formParams.headUrl = this.userInfo.headUrl
      this.formParams.nickName = this.userInfo.nickName
      this.formParams.signature = this.userInfo.signature
    },
  }
</script>

<style scoped lang="less">
  .editPopup {
    top: 0;
    transform: none;
    background-color: #fff;

    ::v-deep .van-form {
      .van-cell-group {
        background: #fff;
      }
    }

    ::v-deep .van-button {
      color: #fff;
    }
  }
</style>
