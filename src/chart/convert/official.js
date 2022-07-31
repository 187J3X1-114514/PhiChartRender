import Chart from '../index';
import Judgeline from '../judgeline';
import Note from '../note';

export default function OfficialChartConverter(_chart)
{
    let chart = new Chart();
    let rawChart = convertOfficialVersion(_chart);

    chart.offset = rawChart.offset;

    rawChart.judgeLineList.forEach((_judgeline, index) =>
    {
        let judgeline = new Judgeline({ id: index });

        _judgeline.speedEvents.forEach((e) =>
        {
            judgeline.event.speed.push({
                startTime     : calcRealTime(e.startTime, _judgeline.bpm),
                endTime       : calcRealTime(e.endTime, _judgeline.bpm),
                value         : e.value,
                floorPosition : e.floorPosition
            });
        });
        _judgeline.judgeLineMoveEvents.forEach((e) => 
        {
            judgeline.event.moveX.push({
                startTime     : calcRealTime(e.startTime, _judgeline.bpm),
                endTime       : calcRealTime(e.endTime, _judgeline.bpm),
                start         : e.start,
                end           : e.end
            });
            judgeline.event.moveY.push({
                startTime : calcRealTime(e.startTime, _judgeline.bpm),
                endTime   : calcRealTime(e.endTime, _judgeline.bpm),
                start     : e.start2,
                end       : e.end2
            });
        });
        _judgeline.judgeLineRotateEvents.forEach((e) => 
        {
            judgeline.event.rotate.push({
                startTime : calcRealTime(e.startTime, _judgeline.bpm),
                endTime   : calcRealTime(e.endTime, _judgeline.bpm),
                start     : -(Math.PI / 180) * e.start,
                end       : -(Math.PI / 180) * e.end
            });
        });
        _judgeline.judgeLineDisappearEvents.forEach((e) =>
        {
            judgeline.event.alpha.push({
                startTime : calcRealTime(e.startTime, _judgeline.bpm),
                endTime   : calcRealTime(e.endTime, _judgeline.bpm),
                start     : e.start,
                end       : e.end
            });
        });
        judgeline.sortEvent();

        { // 考虑到 js 精度，此处重新计算 Speed 事件的 floorPosition 值
            let currentFloorPosiiton = 0;

            judgeline.event.speed.forEach((event) =>
            {
                if (event.startTime < 0) event.startTime = 0;
                event.floorPosition = currentFloorPosiiton;
                currentFloorPosiiton = Math.fround(currentFloorPosiiton + (event.endTime - event.startTime) * event.value);
            });
        }

        _judgeline.notesAbove.forEach((rawNote) =>
        {
            let note = pushNote(rawNote, judgeline, _judgeline.bpm, true);
            chart.notes.push(note);
        });
        _judgeline.notesBelow.forEach((rawNote) =>
        {
            let note = pushNote(rawNote, judgeline, _judgeline.bpm, false);
            chart.notes.push(note);
        });

        chart.judgelines.push(judgeline);
    });

    chart.notes.sort((a, b) => a.time - b.time);
    chart.notes.forEach((note, index) =>
    {
        if (!chart.notes[index + 1]) return;
        if (Number(chart.notes[index + 1].time.toFixed(4)) === Number(note.time.toFixed(4))) {
            note.isMulti = true;
            chart.notes[index + 1].isMulti = true;
        }
    });

    return chart;

    function pushNote(rawNote, judgeline, bpm = 120, isAbove = true)
    {
        rawNote.isAbove = isAbove;
        rawNote.time = calcRealTime(rawNote.time, bpm);
        rawNote.holdTime = calcRealTime(rawNote.holdTime, bpm);
        rawNote.holdEndTime = rawNote.time + rawNote.holdTime;

        if (rawNote.type == 3)
        {
            rawNote.speed = 1;
        }

        {  // 考虑到 js 精度，此处重新计算 Note 的 floorPosition 值
            let noteStartSpeedEvent;
            let noteEndSpeedEvent;

            for (const event of judgeline.event.speed)
            {
                if (rawNote.time > event.startTime && rawNote.time > event.endTime) continue;
                if (rawNote.time < event.startTime && rawNote.time < event.endTime) break;

                noteStartSpeedEvent = event;
            }

            rawNote.floorPosition = noteStartSpeedEvent ? noteStartSpeedEvent.floorPosition + noteStartSpeedEvent.value * (rawNote.time - noteStartSpeedEvent.startTime) : 0;

            if (rawNote.type == 3)
            {
                for (const event of judgeline.event.speed)
                {
                    if (rawNote.holdEndTime > event.startTime && rawNote.holdEndTime > event.endTime) continue;
                    if (rawNote.holdEndTime < event.startTime && rawNote.holdEndTime < event.endTime) break;

                    noteEndSpeedEvent = event;
                }

                rawNote.holdLength = (noteEndSpeedEvent ? noteEndSpeedEvent.floorPosition + noteEndSpeedEvent.value * (rawNote.holdEndTime - noteEndSpeedEvent.startTime) : 0) - rawNote.floorPosition;
            }
            else
            {
                rawNote.holdLength = 0;
            }
        }

        return new Note({
            lineId        : rawNote.lineId,
            type          : rawNote.type,
            time          : rawNote.time,
            holdTime      : rawNote.holdTime,
            holdLength    : rawNote.holdLength,
            positionX     : rawNote.positionX,
            floorPosition : rawNote.floorPosition,
            speed         : rawNote.speed,
            isAbove       : rawNote.isAbove,
            judgeline     : judgeline
        });
    }
};


function convertOfficialVersion(chart)
{
    let newChart = JSON.parse(JSON.stringify(chart));
    
    switch (newChart.formatVersion)
    {
        case 1:
        {
            newChart.formatVersion = 3;
            for (const i of newChart.judgeLineList)
            {
                let floorPosition = 0;
                
                for (const x of i.speedEvents)
                {
                    if (x.startTime < 0) x.startTime = 0;
                    x.floorPosition = floorPosition;
                    floorPosition += (x.endTime - x.startTime) * x.value / i.bpm * 1.875;
                }
                
                for (const x of i.judgeLineDisappearEvents)
                {
                    x.start2 = 0;
                    x.end2   = 0;
                }
                
                for (const x of i.judgeLineMoveEvents)
                {
                    x.start2 = x.start % 1e3 / 520;
                    x.end2   = x.end % 1e3 / 520;
                    x.start  = parseInt(x.start / 1e3) / 880;
                    x.end    = parseInt(x.end / 1e3) / 880;
                }
                
                for (const x of i.judgeLineRotateEvents)
                {
                    x.start2 = 0;
                    x.end2   = 0;
                }
            }
        }
        case 3: {
            break;
        }
        default:
            throw new Error('Unsupported chart version: ' + newChart.formatVersion);
    }
    
    return newChart;
}

function calcRealTime(time, bpm) {
    return Number(Number(time / bpm * 1.875).toFixed(4));
}