import * as http from "./http";

function request(opts, cb) {
    if (opts) {
        Object.assign(opts, {protocol: "https:"})
    }
    return http.request(opts, cb)
}

export default { ...http, request };