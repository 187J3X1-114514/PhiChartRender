function join(path: string, ...paths: string[]): string {
    let sep = '/';
    let result_drive = '';
    let result_path = path.endsWith('/') ? path : path + sep;
    for (var p of paths) {
        if (p.endsWith("/")) {
            p = p.slice(0, p.length - 1)
        }
        if (p.startsWith("/")) {
            p = p.slice(1, p.length)
        }
        const p_path = p;
        if (p_path && p_path[0] === '/') {
            result_drive = '';
            result_path = p_path;
            continue;
        }
        if (result_path.endsWith('/')) {
            if (p_path.startsWith('/')) {
                result_path += p_path.substring(1);
            } else {
                result_path += p_path;
            }
        } else {
            result_path += sep + p_path;
        }
    }
    return result_path;
}
function dirname(p: string): string {
    // Returns the directory component of a pathname
    p = String(p);
    const sep = "/";
    const i = p.lastIndexOf(sep) + 1;
    let head = p.slice(0, i);

    if (head && head !== sep.repeat(head.length)) {
        head = head.replace(new RegExp(sep + '+$', 'g'), '');
    }

    return head;
}
export {
    join,dirname
}