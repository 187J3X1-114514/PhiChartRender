import type { Config, Context } from '@netlify/edge-functions'
const ROOT = "proxy"
const PHIRA_API_BASE_URL = "https://phira.5wyxi.com/"
async function handlePhiraApi(request: Request, p: string) {
    const allp = p.split("*")
    const response = await fetch(PHIRA_API_BASE_URL + allp[0], {
        headers: request.headers,
        body: request.method == "GET" || request.method == "HEAD" ? null : request.body,
        method: request.method
    })
    console.log(`URL: ${PHIRA_API_BASE_URL + allp[0]} P:${allp} ${"R:"+response.redirected} ${response.status} ${response.headers.get("Location")}`)
    const newHeader = new Headers(response.headers)
    if (newHeader.get("Access-Control-Allow-Origin") != null) {
        newHeader.set("Access-Control-Allow-Origin", "*")
    } else {
        newHeader.append("Access-Control-Allow-Origin", "*")
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeader,
    });
}

const types: { [key: string]: (request: Request, p: string) => Promise<Response> } = {
    "phira-api": handlePhiraApi
}
export default async (request: Request, context: Context) => {
    const src = request.url.split(ROOT)[0]
    const p = request.url.split(ROOT)[1].slice(1, request.url.split(ROOT)[1].length)
    if (!(src.startsWith("http://localhost:") || src.startsWith("https://phisimplus.netlify.app"))) return new Response(null, {
        status: 403
    })
    const type = p.split("+")[0]
    if (types[type] == undefined) return new Response(null, {
        status: 400
    })
    const fn = types[type]!
    return await fn(request, p.split("+").pop()!)
}

export const config: Config = {
    path: ('/' + ROOT + '/*') as any
}

