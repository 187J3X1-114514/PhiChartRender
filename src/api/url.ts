const PHIRA_API_CORS = "https://phisimplus.netlify.app/phira-api/"
const PHIRA_FILE_CORS = "https://phisimplus.netlify.app/phira-file/"
const PHIRA_API_BASE_URL_NO_CORS1 = "https://api.phira.cn/"
const PHIRA_API_BASE_URL_NO_CORS2 = "https://files-cf.phira.cn/"
const PHIRA_API_BASE_URL = PHIRA_API_CORS + PHIRA_API_BASE_URL_NO_CORS1
const PHIRA_API_BASE_URL_NO_CORS = PHIRA_API_BASE_URL_NO_CORS1
const PHIRA_API_URL_ME = PHIRA_API_BASE_URL_NO_CORS + "me"
const PHIRA_API_URL_LOGIN = PHIRA_API_BASE_URL_NO_CORS + "login"
const PHIRA_API_URL_CHART = PHIRA_API_BASE_URL_NO_CORS + "chart"
const PHIRA_API_URL_GETCHART = PHIRA_API_BASE_URL + "chart/"
const PHIRA_PROTOCOL2 = "https://phira.moe/privacy-policy"
const PHIRA_PROTOCOL1 = "https://phira.moe/terms-of-use"
export const PHIRA_PROTOCOL1_TEXT = "https://phisimplus.netlify.app/phira-TermsOfUse"
export const PHIRA_PROTOCOL2_TEXT = "https://phisimplus.netlify.app/phira-PrivacyPolicy"

export function buildPhriaApiURL(p:string){
    if (document.URL.startsWith("http://localhost:")){
        return "http://localhost:8888/proxy/phira-api+"+p
    }else{
        return "https://phisimplus.netlify.app/proxy/phira-api+"+p
    }
}
export {PHIRA_FILE_CORS, PHIRA_PROTOCOL1, PHIRA_PROTOCOL2, PHIRA_API_CORS, PHIRA_API_BASE_URL, PHIRA_API_URL_CHART, PHIRA_API_URL_GETCHART, PHIRA_API_URL_LOGIN, PHIRA_API_URL_ME, PHIRA_API_BASE_URL_NO_CORS1, PHIRA_API_BASE_URL_NO_CORS2 }

