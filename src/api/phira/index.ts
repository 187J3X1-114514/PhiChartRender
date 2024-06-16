import * as API_URL from '../url'
fetch('https://api.phira.cn/chart?pageNum=28&page=1&order=-updated')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // 处理从API获取的数据
        console.log(data);
    })
    .catch(error => {
        // 处理错误
        console.error('There was a problem with the fetch operation:', error);
    });
export interface loginResult {
    api?: PhiraAPI, error: string, status: number, ok: boolean
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
        if (!url.includes(API_URL.PHIRA_API_CORS)) {
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
}