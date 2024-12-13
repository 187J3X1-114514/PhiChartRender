import { log, ON_TAURI } from '@/ui/tauri'
import * as API_URL from '../url'
import { ClientOptions, fetch as TFetch } from '@tauri-apps/plugin-http';
import { PHIRA_API_BASE_URL_NO_CORS1 } from '../url';

export const AUTOFetch = (input: URL | Request | string, init?: RequestInit & ClientOptions) => {
    if (ON_TAURI) log.info("请求：" + input)
    return !ON_TAURI ? fetch(input, init) : TFetch(input, init)
}
export interface loginResult {
    api?: PhiraAPI, error: string, status: number, ok: boolean
}
export interface searchResult {
    count: number,
    maxPages: number,
    page: number,
    results: PhiraAPIChartInfo[]
}
export class PhiraAPI {
    public userToken: string
    public userID: number
    public userRefreshToken: string
    public userName: string
    private email: string
    private password: string
    public userInfo: any
    private constructor(loginJson: any, userData: { name: string, email: string, password: string }, meJson: any) {
        this.userID = loginJson["id"]
        this.userRefreshToken = loginJson["refreshToken"]
        this.userToken = loginJson["token"]
        this.userName = userData.name
        this.email = userData.email
        this.password = userData.password
        this.userInfo = meJson
    }
    static async login(email: string, password: string) {
        return new Promise<loginResult>(async (r__) => {
            let st = performance.now()
            let result: { [key: string]: any } = {}
            let loginJson
            let fetchResult: any
            let fetchJSON
            let meJson
            let checkT = setInterval(() => {
                clearInterval(checkT)
                //if (performance.now() - st >= 40 * 1000) {
                //    r["api"] = undefined
                //    r["status"] = -1
                //    r["error"] = "登录超时"
                //    r["ok"] = false
                //    clearInterval(checkT)
                //    r__(r as loginResult)
                //}
            }, 100)
            try {
                fetchResult = await fetch(API_URL.PHIRA_API_URL_LOGIN, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email, password: password
                    }),

                })
                fetchJSON = await fetchResult.json()
            } catch (e) {
                result["api"] = undefined
                result["status"] = -1
                result["error"] = e
                result["ok"] = false
                r__(result as loginResult)
            }

            if (!fetchResult.ok) {
                result["api"] = undefined
                result["status"] = fetchResult.status
                result["error"] = fetchJSON["error"]
                result["ok"] = false
                r__(result as loginResult)
            }
            loginJson = fetchJSON
            try {
                fetchResult = await fetch(API_URL.PHIRA_API_URL_ME, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + loginJson["token"]
                    }
                })
                fetchJSON = await fetchResult.json()
            } catch (e) {
                result["api"] = undefined
                result["status"] = fetchResult.status
                result["error"] = e
                result["ok"] = false
                r__(result as loginResult)
            }

            if (!fetchResult.ok) {
                result["api"] = undefined
                result["status"] = fetchResult.status
                result["error"] = fetchJSON["error"]
                result["ok"] = false
                r__(result as loginResult)
            }
            meJson = fetchJSON
            result["api"] = new this(loginJson, { name: meJson["name"], email: email, password: password }, meJson)
            result["status"] = 200
            result["error"] = ""
            result["ok"] = true
            r__(result as loginResult)
        })
    }
    async getAvatar() {
        return await new Promise<string>(async (r) => {
            let imageUrl: string = this.userInfo["avatar"]
            this.fetch(
                ON_TAURI ?
                    imageUrl.replace("https://api.phira.cn/", PHIRA_API_BASE_URL_NO_CORS1) :
                    API_URL.proxyPhriaApiURL(imageUrl.replace("https://api.phira.cn/", "")
                    ),
                'GET',
                {},
                undefined
            )
                .then(response => {
                    return response.blob()
                })
                .then(blob => {
                    r(new Promise((resolve, _reject) => {
                        const fileReader = new FileReader();
                        fileReader.onload = (e) => {
                            resolve((e.target!.result as string).replace("application/octet-stream", "image/png"));
                        };
                        fileReader.readAsDataURL(blob);
                        fileReader.onerror = () => {
                        };
                    }))
                })
                .catch(() => {
                    r("")
                });

        })
    }
    fetch(url: string, method?: string, headers?: any, body?: any, noredirect: boolean = false, navite: boolean = true) {
        if (ON_TAURI && navite) {
            return AUTOFetch(
                url,
                {
                    method: method,
                    headers: {
                        ...headers,
                        'Authorization': 'Bearer ' + this.userToken
                    },
                    body: body,
                    ...(noredirect ? { redirect: "manual" } : {})
                }
            )
        } else {
            return fetch(
                url,
                {
                    method: method,
                    headers: {
                        ...headers,
                        'Authorization': 'Bearer ' + this.userToken
                    },
                    body: body,
                    ...(noredirect ? { redirect: "manual" } : {})
                }
            )
        }

    }
    async reLogin() {
        let r: { [key: string]: any } = {}
        let loginJson
        let fetchResult
        let fetchJSON
        let meJson
        fetchResult = await fetchWithTimeout(API_URL.PHIRA_API_URL_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.email, password: this.password
            }),
            timeout: 10000
        })
        fetchJSON = await fetchResult.json()
        if (!fetchResult.ok) {
            r["api"] = undefined
            r["status"] = fetchResult.status
            r["error"] = fetchJSON["error"]
            r["ok"] = false
            return r as loginResult
        }
        loginJson = fetchJSON
        fetchResult = await fetch(API_URL.PHIRA_API_URL_ME, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + loginJson["token"]
            }
        })
        fetchJSON = await fetchResult.json()
        if (!fetchResult.ok) {
            r["api"] = undefined
            r["status"] = fetchResult.status
            r["error"] = fetchJSON["error"]
            r["ok"] = false
            return r as loginResult
        }
        meJson = fetchJSON
        this.userID = loginJson["id"]
        this.userRefreshToken = loginJson["refreshToken"]
        this.userToken = loginJson["token"]
        this.userInfo = meJson
    }
    async search(order: SearchOrder = SearchOrder.timeReverse, division: SearchDivision = SearchDivision.ordinary, searchText?: string, pageNum = 20, page = 1, type: number = -1) {
        let baseUrl = API_URL.PHIRA_API_URL_CHART
        function addParams(url: string, queryParams: { [key: string]: string | number }): string {
            let updatedUrl = url;
            const hasQueryParams = url.includes('?');
            const separator = hasQueryParams ? '&' : '?';
            Object.keys(queryParams).forEach((key, index) => {
                const connector = index === 0 ? separator : '&';
                updatedUrl = updatedUrl + `${connector}${key}=${queryParams[key]}`;
            });
            return updatedUrl;
        }
        if (searchText != undefined) {
            if (searchText.trim().startsWith("#")) {
                let id = (searchText.trim().split("#")[1]).trim()
                if (id != undefined) {
                    baseUrl = encodeURI(baseUrl + "/" + id)
                    try {
                        let rep = await this.fetch(baseUrl, "GET", null, null, undefined, false)
                        if (rep.status == 200) {
                            let r = await rep.json() as PhiraAPIChartInfo
                            if (r.id != undefined) {
                                let rr = {
                                    count: 1,
                                    maxPages: 1,
                                    page: 1,
                                    results: [r]
                                }
                                return rr
                            }
                        }
                    } catch (e) { }
                    return {
                        count: 0,
                        maxPages: 0,
                        page: 0,
                        results: []
                    }
                }
            }
        }
        baseUrl = addParams(baseUrl, {
            page: page,
            pageNum: pageNum,
            order: order.valueOf(),
            ...(() => {
                let r = {}
                if (searchText) r = { ...r, search: searchText }
                if (division != SearchDivision.ordinary) r = { ...r, division: division.valueOf() }
                if (type != -1) r = { ...r, type: type }
                return r
            })()
        })
        baseUrl = encodeURI(baseUrl)
        let r = await (await this.fetch(baseUrl, "GET", null, null, undefined, true)).json() as searchResult
        r.page = page
        r.maxPages = Math.ceil(r.count / pageNum)
        return r
    }
    static getSearchOrder(string: string): SearchOrder | undefined {
        return Object.values(SearchOrder).find(order => order === string) as SearchOrder | undefined;
    }
    static getSearchDivision(string: string): SearchDivision | undefined {
        return Object.values(SearchDivision).find(order => order === string) as SearchDivision | undefined;
    }
}
export enum SearchOrder {
    rating = "rating",
    time = "updated",
    name = "name",
    ratingReverse = "-rating",
    timeReverse = "-updated",
    nameReverse = "-name",

}
export enum SearchDivision {
    ordinary = "",
    viewing = "visual",
    difficulty = "plain",
    shenjin = "troll"
}
export interface PhiraAPIChartInfo {
    id: number
    name: string
    level: string
    charter: string
    composer: string
    illustrator: string
    description: string
    illustration: string
    preview: string
    file: string
    uploader: number
    tags: string[]
    created: string
    updated: string
    chartUpdated: string
}

async function fetchWithTimeout(resource: string | URL | globalThis.Request, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 10000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}
