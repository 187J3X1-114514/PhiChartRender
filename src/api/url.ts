export const PHIRA_API_CORS = "https://phisimplus.netlify.app/phira-api/"
export const PHIRA_FILE_CORS = "https://phisimplus.netlify.app/phira-file/"
export const PHIRA_API_BASE_URL_NO_CORS1 = "https://phira.5wyxi.com/"
export const PHIRA_API_BASE_URL_NO_CORS2 = "https://files-cf.phira.cn/"
export const PHIRA_API_BASE_URL = PHIRA_API_CORS + PHIRA_API_BASE_URL_NO_CORS1
export const PHIRA_API_BASE_URL_NO_CORS = PHIRA_API_BASE_URL_NO_CORS1
export const PHIRA_API_URL_ME = PHIRA_API_BASE_URL_NO_CORS + "me"
export const PHIRA_API_URL_LOGIN = PHIRA_API_BASE_URL_NO_CORS + "login"
export const PHIRA_API_URL_CHART = PHIRA_API_BASE_URL_NO_CORS + "chart"
export const PHIRA_API_URL_GETCHART = PHIRA_API_BASE_URL + "chart/"
export const PHIRA_PROTOCOL2 = "https://phira.moe/privacy-policy"
export const PHIRA_PROTOCOL1 = "https://phira.moe/terms-of-use"
export const PHIRA_PROTOCOL1_TEXT = "https://phisimplus.netlify.app/phira-TermsOfUse"
export const PHIRA_PROTOCOL2_TEXT = "https://phisimplus.netlify.app/phira-PrivacyPolicy"

export function proxyPhriaApiURL(p: string) {
    if (!window.location.origin.includes("phisimplus.netlify.app")) {
        return window.location.origin + "/proxy/phira-api+" + p
    } else {
        return "https://phisimplus.netlify.app/proxy/phira-api+" + p
    }
}