import request from '@/utils/request'

/**
 * 问卷列表
 * @param {*} data 
 * @returns 
 */
 export function surveyGetPage(data) {
    return request({
        url: '/activity/survey/question/getSurveyView',
        method: 'post',
        data
    })
}

/**
 * 提交
 * @param {*} data 
 * @returns 
 */
export function submitSurvey(data) {
    return request({
        url: '/activity/survey/detail/submitSurvey',
        method: 'post',
        data
    })
}
