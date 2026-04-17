import Vue from 'vue'
import Vuex from 'vuex'
import {
    getUserInfo,
    setUserInfo,
    removeUserInfo,
    getSearchLabel,
    setSearchLabel,
    removeSearchLabel,
    getCookie,
    setCookie,
    removeCookie
} from '@/utils/auth'
import { getDevice, randomString } from '@/utils/tools'
import { encrypt } from '@/utils/rsa'
import { macLogin } from '@/apis/user'
import _ from 'lodash'
import { Toast } from 'vant'
import md5 from 'md5'
import { Dialog } from 'vant'
import PubSub from 'pubsub-js'
import GoDB from 'godb';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        tabActive: 0,
        token: getCookie('CLSQ-Token'),
        uuid: getCookie('CLSQ-UUID'),
        inviteCode: getCookie('CLSQ-INVITECODE'),
        agentCode: getCookie('CLSQ-AGENTCODE'),
        userInfo: getUserInfo(),
        searchLabel: getSearchLabel(),
        device: getDevice(),
        cdnLineList: [],
        cdnLine: null,
        appFooter: [],
        wsInfo: null,
        dataDic: {},
        isApp: getCookie('CLSQ-ISAPPKEY'),
        isSaveQrCode: getCookie('CLSQ-ISSAVEQRCODE'),
        chatToken: getCookie('CHAT-TOKEN'),
        previousRoute: '',
        ws: null,
        chatRoomList: [],
        unreadMessage: true,
        appLeaveTime: null, // app切换出去时记录时间，超过指定时间时重新加载app
        appLoadLiveTime: null, // app加载直播数据的时间，定时刷新最新数据
        appLoadLouFengTime: null, // app加载直播数据的时间，定时刷新最新数据
        // godb: new GoDB('localDB'),
        godb: null,
        banner: {},
        darkShow: true,
    },
    mutations: {
        changeTab(state,data){
            state.tabActive = data
        },
        SET_TOKEN: (state, token) => {
            state.token = token
            setCookie('CLSQ-Token', token)
        },
        SET_UUID: (state, uuid) => {
            state.uuid = uuid
            setCookie('CLSQ-UUID', uuid)
        },
        SET_ISAPP: (state, status) => {
            state.isApp = status
            setCookie('CLSQ-ISAPPKEY', status)
        },
        SET_INVITECODE: (state, code) => {
            state.inviteCode = code
            setCookie('CLSQ-INVITECODE', code)
        },
        SET_AGENTCODE: (state, code) => {
            state.agentCode = code
            setCookie('CLSQ-AGENTCODE', code)
        },
        SET_ISSAVEQRCODE: (state, status) => {
            state.isSaveQrCode = status
            setCookie('CLSQ-ISSAVEQRCODE', status)
        },
        SET_USERINFO: (state, userInfo) => {
            state.userInfo = userInfo
            setUserInfo(userInfo)
        },
        SET_SEARCHLABEL: (state, label) => {
            const targetData = state.searchLabel.find(one => one.tagName === label.tagName)
            if(!targetData) {
                state.searchLabel.push(label)
                setSearchLabel(state.searchLabel)
            }
        },
        SET_CDNLINELIST: (state, lineList) => {
            state.cdnLineList = lineList
        },
        SET_CDNLINE: (state, line) => {
            state.cdnLine = line
        },
        CHANGE_CDNLINE: (state, lineData) => {
            if (lineData) {
                state.cdnLine = lineData
            } else {
                if (state.cdnLineList && state.cdnLineList.length > 1) {
                    const curIdx = _.findIndex(state.cdnLineList, state.cdnLine)
                    if (curIdx === state.cdnLineList.length - 1) {
                        state.cdnLine = state.cdnLineList[0]
                    } else {
                        state.cdnLine = state.cdnLineList[curIdx + 1]
                    }
    
                }
            }
            Toast('切换至' + state.cdnLine.cdnName)
        },
        SET_APPFOOTER: (state, footer) => {
            state.appFooter = footer
        },
        SET_WSINFO: (state, info) => {
            state.wsInfo = info
        },
        SET_DATADIC: (state, data) => {
            state.dataDic = data
        },
        SET_CHATROOMLIST: (state, data) => {
            state.chatRoomList = data
        },
        SET_UNREADMESSAGET: (state, data) => {
            state.unreadMessage = data
        },
        CLEAR_TOKEN: (state) => {
            removeCookie('CLSQ-Token')
            state.token = ''
        },
        CLEAR_USERINFO: (state) => {
            removeUserInfo()
            state.userInfo = null
        },
        CLEAR_SEARCHLABEL: (state) => {
            removeSearchLabel()
            state.searchLabel = []
        },
        CLEAR_WSINFO: (state) => {
            state.wsInfo = null
        },
        setBanner: (state, data) => {
            state.banner = data
        },
        SET_DARK_SHOW: (state) => {
            state.darkShow = false
        },
        SET_GODB: (state, data) => {
            state.godb = data
        },
    },
    actions: {
        macLogin({ commit, state, dispatch }) {
            if (!state.uuid) {
                const uuid = randomString(24)
                commit('SET_UUID', uuid)
                // if (state.godb) {
                //     state.godb.onOpened = () => {
                //         state.godb.drop()
                //     }
                // }
            }
            const params = {
                merchantAcct: process.env.VUE_APP_MERCHANTACCT,
                mac: state.uuid,
                os: state.isApp ? 0 : 2,
                tips: md5(process.env.VUE_APP_MERCHANTACCT + state.uuid + (state.isApp ? 0 : 2)),
                inviteCode: state.inviteCode || '',
                ...(state.agentCode ? { agentCode: state.agentCode } : {})
            }
            return macLogin({ encrypt: encrypt(JSON.stringify(params)) })
        },
        logout({ commit, state, dispatch }) {
            return new Promise((resolve, reject) => {
                commit('CLEAR_TOKEN')
                commit('CLEAR_USERINFO')
                commit('CLEAR_WSINFO')
                resolve()
            })
        }
    },
    modules: {
    },
    getters: {
        token: state => state.token,
        uuid: state => state.uuid,
        isApp: state => state.isApp,
        inviteCode: state => state.inviteCode,
        agentCode: state => state.agentCode,
        isSaveQrCode: state => state.isSaveQrCode,
        userInfo: state => state.userInfo,
        searchLabel: state => state.searchLabel,
        cdnLineList: state => state.cdnLineList,
        cdnLine: state => state.cdnLine,
        appFooter: state => state.appFooter,
        wsInfo: state => state.wsInfo,
        dataDic: state => state.dataDic,
        chatRoomList: state => state.chatRoomList,
        unreadMessage: state => state.unreadMessage,
    }
})
