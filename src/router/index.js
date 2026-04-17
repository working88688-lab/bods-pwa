import Vue from 'vue'
import VueRouter from 'vue-router'
import { getCookie } from '@/utils/auth'
import store from '@/store'
import { Dialog } from 'vant'
import { initWebSdkForUser } from '@/utils/websdk'

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

const routes = [
  {
    path: '/',
    name: '/redirect',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Redirect/index'),
  },
  {
    path: '/video',
    name: 'video',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Video'),
  },
  {
    path: '/movie',
    name: '/movie',
    meta: {
      loginAuth: false,
      show: true,
    },
    component: () => import('@/views/Movie/index'),
  },
  // {
  //     path: '/2d',
  //     name: '/2d',
  //     meta: {
  //         loginAuth: false,
  //         show: true
  //     },
  //     component: () => import('@/views/2d/index')
  // },
  {
    path: '/darknet',
    name: '/darknet',
    meta: {
      loginAuth: false,
      show: true,
    },
    component: () => import('@/views/darknet/index'),
  },
  {
    path: '/anime',
    name: '/anime',
    meta: {
      loginAuth: false,
      show: true,
    },
    component: () => import('@/views/Work/Cartoon/index'),
  },
  {
    path: '/survey',
    name: 'survey',
    meta: {
      loginAuth: false,
      safeBottom: true,
    },
    component: () => import('@/views/Survey'),
  },
  {
    path: '/fiction',
    name: 'fiction',
    meta: {
      loginAuth: false,
    },
    redirect: '/fiction/category',
    component: () => import('@/views/Work/Fiction/index'),
    children: [
      {
        path: 'category',
        name: 'fictionCategory',
        meta: {
          loginAuth: false,
        },
        component: () => import('@/views/Work/Fiction/category'),
      },
    ],
  },
  {
    path: '/2d',
    name: '/2d',
    meta: {
      loginAuth: false,
      show: true,
    },
    component: () => import('@/views/Work/Comics/index'),
  },
  {
    path: '/nudeChat',
    name: '/nudeChat',
    meta: {
      loginAuth: false,
    },
    redirect: '/nudeChat/category',
    component: () => import('@/views/NudeChat'),
    children: [
      {
        path: 'category',
        name: 'nudeChatCategory',
        meta: {
          loginAuth: false,
        },
        component: () => import('@/views/NudeChat/Category'),
      },
    ],
  },
  {
    path: '/streaming',
    name: '/streaming',
    meta: {
      loginAuth: true,
    },
    redirect: '/streaming/category',
    component: () => import('@/views/Streaming'),
    children: [
      {
        path: 'category',
        name: 'streamingCategory',
        meta: {
          loginAuth: true,
        },
        component: () => import('@/views/Streaming/Category'),
      },
    ],
  },
  {
    path: '/product',
    name: '/product',
    meta: {
      loginAuth: false,
    },
    redirect: '/product/category',
    component: () => import('@/views/Product/index'),
    children: [
      {
        path: 'category',
        name: 'productCategory',
        meta: {
          loginAuth: false,
        },
        component: () => import('@/views/Product/Category'),
      },
    ],
  },
  {
    path: '/ai',
    name: '/ai',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/AI/index'),
  },
  {
    path: '/rank',
    name: '/rank',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/Rank/index'),
  },
  {
    path: '/square',
    name: '/square',
    meta: {
      loginAuth: false,
      show: true,
    },
    component: () => import('@/views/Square/index'),
  },
  {
    path: '/chatroom',
    name: 'chatroom',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/ChatRoom'),
  },
  {
    path: '/mine',
    name: '/mine',
    meta: {
      loginAuth: true,
      show: true,
    },
    component: () => import('@/views/My/index'),
  },
  {
    path: '/movieList',
    name: 'MovieList',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Movie/MovieList'),
  },
  {
    path: '/tagDetails',
    name: 'TagDetails',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Movie/TagDetails'),
  },
  {
    path: '/tagSearchResult',
    name: 'TagSearchResult',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Search/TagSearchResult'),
  },

  {
    path: '/catalog',
    name: 'catalog',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Work/Catalog'),
  },
  {
    path: '/workList',
    name: 'WorkList',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Work/WorkList'),
  },
  {
    path: '/fictionPlay',
    name: 'fictionPlay',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Play/FictionPlay'),
  },
  {
    path: '/comicsPlay',
    name: 'comicsPlay',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Play/ComicsPlay'),
  },
  {
    path: '/cartoonPlay',
    name: 'cartoonPlay',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Play/CartoonPlay'),
  },
  {
    path: '/workDetail',
    name: 'workDetail',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Work/WorkDetail'),
  },
  {
    path: '/squareDetail',
    name: 'squareDetail',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Square/Detail'),
  },
  {
    path: '/productDetail',
    name: 'productDetail',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Product/ProductDetail'),
  },
  {
    path: '/live',
    name: 'live',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/Streaming/Live/index'),
  },
  {
    path: '/liveDetail',
    name: 'liveDetail',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/Streaming/LiveDetail/index'),
  },
  {
    path: '/groupChat',
    name: 'groupChat',
    meta: {
      loginAuth: true,
      noCache: true,
    },
    component: () => import('@/views/ChatRoom/GroupChat/index'),
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/ChatRoom/Forbidden/index'),
  },
  {
    path: '/collectAnchor',
    name: 'collectAnchor',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/CollectAnchor/index'),
  },
  {
    path: '/anchorLike',
    name: 'anchorLike',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/NudeChat/AnchorLike'),
  },
  {
    path: '/nudeChatDetail',
    name: 'NudeChatDetail',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Square/NudeChatDetail'),
  },
  {
    path: '/chatDetail',
    name: 'ChatDetail',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Square/ChatDetail'),
  },
  {
    path: '/anchorImages',
    name: 'anchorImages',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/NudeChat/AnchorImages'),
  },
  {
    path: '/play',
    name: 'play',
    meta: {
      loginAuth: false,
      noCache: true,
    },
    component: () => import('@/views/Play/MoviePlayer'),
  },
  {
    path: '/videoPlayer',
    name: 'VideoPlayer',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Play/VideoPlayer'),
  },
  {
    path: '/fullScreenPlayer',
    name: 'fullScreenPlayer',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Play/FullScreenPlayer'),
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Login'),
  },
  {
    path: '/setting',
    name: 'setting',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Setting'),
  },
  {
    path: '/bindPhone',
    name: 'bindPhone',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Setting/BindPhone'),
  },
  {
    path: '/retrieve',
    name: 'retrieve',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Setting/Retrieve'),
  },
  {
    path: '/homepage',
    name: 'homepage',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/My/Homepage'),
  },
  {
    path: '/editInfo',
    name: 'editInfo',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/EditInfo'),
  },
  {
    path: '/publish',
    name: 'publish',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Publish'),
  },
  {
    path: '/follow',
    name: 'follow',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Follow'),
  },
  {
    path: '/fans',
    name: 'fans',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Fans'),
  },
  {
    path: '/notice',
    name: 'notice',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Notice'),
  },
  {
    path: '/reserveRecord',
    name: 'reserveRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/NudeChat/ReserveRecord'),
  },
  {
    path: '/history',
    name: 'history',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/History'),
  },
  {
    path: '/like',
    name: 'Like',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Like'),
  },
  {
    path: '/buy',
    name: 'buy',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Buy'),
  },
  {
    path: '/vip',
    name: 'VIP',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Vip'),
  },
  {
    path: '/buyRecord',
    name: 'buyRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Vip/buyRecord'),
  },
  {
    path: '/FQ',
    name: 'FQ',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/My/FQ'),
  },
  {
    path: '/wallet',
    name: 'wallet',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Wallet/index'),
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Wallet/Withdraw'),
  },
  {
    path: '/withdrawRecord',
    name: 'withdrawRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Wallet/WithdrawRecord'),
  },
  {
    path: '/promotionIncome',
    name: 'promotionIncome',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Wallet/PromotionIncome'),
  },
  {
    path: '/recharge',
    name: 'recharge',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Wallet/Recharge'),
  },
  {
    path: '/rechargeConfirm',
    name: 'rechargeConfirm',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/RechargeConfirm/index'),
  },
  {
    path: '/promote',
    name: 'promote',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Promote/index'),
  },
  {
    path: '/promoteRecord',
    name: 'promoteRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Promote/PromoteRecord'),
  },
  {
    path: '/creationCenter',
    name: 'creationCenter',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/CreationCenter/index'),
  },
  {
    path: '/task',
    name: 'task',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Task/index'),
  },
  {
    path: '/signin',
    name: 'signin',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Signin/index'),
  },
  {
    path: '/mall',
    name: 'mall',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Mall/index'),
  },
  {
    path: '/mallRecord',
    name: 'mallRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/My/Mall/mallRecord'),
  },
  {
    path: '/feedback',
    name: 'Feedback',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/My/Feedback'),
  },
  {
    path: '/search',
    name: 'Search',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Search'),
  },
  {
    path: '/iframe',
    name: 'iframe',
    meta: {
      loginAuth: false,
    },
    component: () => import('@/views/Iframe'),
  },
  {
    path: '/appCenter',
    name: 'appCenter',
    meta: {
      loginAuth: false,
    },
    redirect: '/appCenter/category',
    component: () => import('@/views/My/AppCenter'),
    children: [
      {
        path: 'category',
        name: 'appCenterCategory',
        meta: {
          loginAuth: false,
        },
        component: () => import('@/views/My/AppCenter/Category'),
      },
    ],
  },
  {
    path: '/customize',
    name: 'customize',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/AI/Customize'),
  },
  {
    path: '/aIRecord',
    name: 'aIRecord',
    meta: {
      loginAuth: true,
    },
    component: () => import('@/views/AI/AIRecord'),
  },
]

const router = new VueRouter({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes,
})

router.beforeEach(async (to, from, next) => {
  store.state.previousRoute = from.path
  if (to.meta && to.meta.loginAuth) {
    const hasToken = getCookie('CLSQ-Token')
    if (hasToken) {
      next()
    } else {
      const res = await store.dispatch('macLogin').catch(() => {
        Dialog.alert({
          title: '提示',
          message: '网络异常，请刷新页面',
          className: 'confirm-dialog',
        })
          .then(async () => {
            window.location.reload()
          })
          .catch(() => {})
      })
      if (res && res.code === 0) {
        const { token, infoPo } = res.data
        store.commit('SET_TOKEN', token)
        store.commit('SET_USERINFO', infoPo)
        initWebSdkForUser(infoPo, {})
        next()
      } else {
        Dialog.alert({
          title: '提示',
          message: '网络异常，请刷新页面',
          className: 'confirm-dialog',
        })
          .then(async () => {
            window.location.reload()
          })
          .catch(() => {})
      }
    }
  } else {
    next()
  }
})

export default router
