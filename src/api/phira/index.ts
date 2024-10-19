import * as API_URL from '../url'
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
            let r: { [key: string]: any } = {}
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
                    })
                })
                fetchJSON = await fetchResult.json()
            } catch (e) {
                r["api"] = undefined
                r["status"] = fetchResult.status
                r["error"] = e
                r["ok"] = false
                return r as loginResult
            }

            if (!fetchResult.ok) {
                r["api"] = undefined
                r["status"] = fetchResult.status
                r["error"] = fetchJSON["error"]
                r["ok"] = false
                return r as loginResult
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
                r["api"] = undefined
                r["status"] = fetchResult.status
                r["error"] = e
                r["ok"] = false
                return r as loginResult
            }

            if (!fetchResult.ok) {
                r["api"] = undefined
                r["status"] = fetchResult.status
                r["error"] = fetchJSON["error"]
                r["ok"] = false
                return r as loginResult
            }
            meJson = fetchJSON
            r["api"] = new this(loginJson, { name: meJson["name"], email: email, password: password }, meJson)
            r["status"] = 200
            r["error"] = ""
            r["ok"] = true
            r__(r as loginResult)
        })
    }
    async getAvatar() {
        return await new Promise<string>(async(r) => {
            let imageUrl:string = this.userInfo["avatar"]
            this.fetch(API_URL.buildPhriaApiURL(imageUrl.replace("https://api.phira.cn/","")),
                'GET',
                {},
                undefined
            )
                .then(response => {
                    console.log(response)
                    console.log(response.headers.entries())
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
    fetch(url: string, method?: string, headers?: any, body?: any,noredirect:boolean=false) {
        return fetch(
            url,
            { method: method, headers: { ...headers, 'Authorization': 'Bearer ' + this.userToken }, body: body,...(noredirect?{redirect:"manual"}:{}) })
    }
    async reLogin() {
        let r: { [key: string]: any } = {}
        let loginJson
        let fetchResult
        let fetchJSON
        let meJson
        fetchResult = await fetch(API_URL.PHIRA_API_URL_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.email, password: this.password
            })
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
        let r = await (await this.fetch(baseUrl, "GET")).json() as searchResult
        r.page = page
        r.maxPages = Math.ceil(r.count / pageNum)
        return r
    }
    getSearchOrder(string: string): SearchOrder | undefined {
        return Object.values(SearchOrder).find(order => order === string) as SearchOrder | undefined;
    }
    getSearchDivision(string: string): SearchDivision | undefined {
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