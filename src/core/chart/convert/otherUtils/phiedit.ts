function floorNum(num:number) {
    return Math.floor(num * 8);
    // return Math.floor(num * (10 ** n)) / (10 ** n);
}

function calculateRealVisibleTime(_bpmList:any, _notes:any) {
    let bpmList = _bpmList.slice();
    let notes = _notes.slice();

    notes.forEach((note:any) => {
        if (!note.visibleBeat) return;

        for (let bpmIndex = 0, bpmLength = bpmList.length; bpmIndex < bpmLength; bpmIndex++) {
            let bpm = bpmList[bpmIndex];

            if (bpm.startBeat > note.visibleBeat) continue;
            note.visibleTime = note.visibleBeat * bpm.beatTime;

            break;
        }
    });

    return notes;
}
export{floorNum,calculateRealVisibleTime}