function bool(bool?: boolean, defaultValue = false) {
    return (typeof bool === 'boolean') ? !!bool : defaultValue;
}

function number(number?: number, defaultValue = 0, min = -Infinity, max = Infinity) {
    return (!isNaN(number as any) && min <= parseFloat(number as any) && parseFloat(number as any) <= max ? parseFloat(number as any) : defaultValue);
}

function text(text?: string, defaultValue = '') {
    return ((typeof text === 'string') && text != '') ? text : defaultValue;
}

export {
    bool,
    number,
    text
}