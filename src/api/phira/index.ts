import * as API_URL from '../url'
export interface loginResult {
    api?: PhiraAPI, error: string, status: number, ok: boolean
}
export interface searchResult {
    count:number,
    maxPages:number,
    page:number,
    results:PhiraAPIChartInfo[]
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
                email: email, password: password
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
        r["api"] = new this(loginJson, { name: meJson["name"], email: email, password: password }, meJson)
        r["status"] = 200
        r["error"] = ""
        r["ok"] = true
        return r as loginResult
    }
    async getAvatar() {
        return await new Promise<HTMLImageElement>((r) => {
            let imageUrl = this.userInfo["avatar"]
            let headers = new Headers();
            headers.append('Authorization', 'Bearer ' + this.userToken);

            this.fetch(imageUrl,
                'GET',
                headers,
            )
                .then(response => response.blob())
                .then(blob => {
                    let objectURL = URL.createObjectURL(blob);
                    let img = document.createElement('img');
                    img.src = objectURL;
                    r(img)
                });

        })
    }
    fetch(url: string, method?: string, headers?: any, body?: any) {
        if (!(url.includes(API_URL.PHIRA_API_CORS)||url.split(API_URL.PHIRA_API_CORS).pop()!.split(API_URL.PHIRA_API_BASE_URL_NO_CORS1).pop()!.length<=12)) {
            url = url.replace(
                API_URL.PHIRA_API_BASE_URL_NO_CORS1,
                API_URL.PHIRA_API_BASE_URL)
                .replace(
                    API_URL.PHIRA_API_BASE_URL_NO_CORS2,
                    API_URL.PHIRA_API_CORS + API_URL.PHIRA_API_BASE_URL_NO_CORS2)
        }
        return fetch(
            url,
            { method: method, headers: { ...headers, 'Authorization': 'Bearer ' + this.userToken }, body: body })
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
    async search(order: SearchOrder = SearchOrder.timeReverse, division: SearchDivision = SearchDivision.ordinary, searchText?: string, pageNum = 1, page = 1) {
        let baseUrl = API_URL.PHIRA_API_URL_CHART
        function addParams(url: string, queryParams: { [key: string]: string | number }): string {
            let updatedUrl = url;
            const hasQueryParams = url.includes('?');
            const separator = hasQueryParams ? '&' : '?';
            Object.keys(queryParams).forEach((key, index) => {
                const connector = index === 0 ? separator : '&';
                updatedUrl += `${connector}${key}=${queryParams[key]}`;
            });
            return updatedUrl;
        }
        addParams(baseUrl, {
            page: page,
            pageNum: 1,
            order: order.valueOf(),
            ...(() => {
                let r = {}
                if (searchText) r = { ...r, search: searchText }
                if (division != SearchDivision.ordinary) r = { ...r, division: division.valueOf() }
                return r
            })()
        })
        baseUrl = encodeURI(baseUrl)
        let r = await(await this.fetch(baseUrl,"GET")).json() as searchResult
        r.page = page
        r.maxPages = Math.ceil(r.count/pageNum)
        return r
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
export interface PhiraAPIChartInfo{
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