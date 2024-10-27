import Cookies from 'js-cookie'

interface language {
    showName: string
    url: string
}

interface languageJSON {
    text: Record<string, string>
}

interface i18nInfo {
    baseDir: string,
    languages: Record<string, language>
}

export class i18n {
    public I18N_INFO: i18nInfo = undefined as any
    public language?: language
    public languageJSON?: languageJSON
    public DefaultLanguageJSON?: languageJSON
    constructor() { }
    async load() {
        this.I18N_INFO = await (await fetch("i18n/info.json")).json() as i18nInfo
        this.language = this.getLanguage(i18n.getUserLanguage())
        this.languageJSON = await (await fetch(this.I18N_INFO.baseDir + "/" + this.language.url)).json()
        this.DefaultLanguageJSON = await (await fetch(this.I18N_INFO.baseDir + "/" + this.I18N_INFO.languages["zh-CN"].url)).json()
        this.replaceHTMLText()
    }
    private getLanguage(name: string) {
        if (this.I18N_INFO.languages[name] != undefined) return this.I18N_INFO.languages[name]
        return this.I18N_INFO.languages["zh-CN"]
    }
    static getUserLanguage() {
        if (Cookies.get("lang") != undefined) {
            return Cookies.get("lang")!
        } else {
            return navigator.language
        }
    }

    replaceHTMLText() {
        for (let key in this.DefaultLanguageJSON!.text) {
            //document.body.innerText = document.body.innerText.replace("$${*" + key + "*}$$", this.get(key))
            
        }
    }

    static setUserLanguage(v: string) {
        Cookies.set("lang", v, {
            expires: 365
        })
    }

    get(key: string) {
        if (this.languageJSON) {
            if (this.languageJSON.text[key]) {
                return this.languageJSON.text[key]
            } else {
                if (this.DefaultLanguageJSON!.text[key]) {
                    return this.DefaultLanguageJSON!.text[key]
                }
            }
        }
        return key
    }
}

export const I18N = new i18n()
await I18N.load()