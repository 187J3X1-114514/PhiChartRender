const PhiEditEasing = [
    (x: number): number => x, //1
    (x: number): number => Math.sin(x * Math.PI / 2), //2
    (x: number): number => 1 - Math.cos(x * Math.PI / 2), //3
    (x: number): number => 1 - (x - 1) ** 2, //4
    (x: number): number => x ** 2, //5
    (x: number): number => (1 - Math.cos(x * Math.PI)) / 2, //6
    (x: number): number => ((x *= 2) < 1 ? x ** 2 : -((x - 2) ** 2 - 2)) / 2, //7
    (x: number): number => 1 + (x - 1) ** 3, //8
    (x: number): number => x ** 3, //9
    (x: number): number => 1 - (x - 1) ** 4, //10
    (x: number): number => x ** 4, //11
    (x: number): number => ((x *= 2) < 1 ? x ** 3 : ((x - 2) ** 3 + 2)) / 2, //12
    (x: number): number => ((x *= 2) < 1 ? x ** 4 : -((x - 2) ** 4 - 2)) / 2, //13
    (x: number): number => 1 + (x - 1) ** 5, //14
    (x: number): number => x ** 5, //15
    (x: number): number => 1 - 2 ** (-10 * x), //16
    (x: number): number => 2 ** (10 * (x - 1)), //17
    (x: number): number => Math.sqrt(1 - (x - 1) ** 2), //18
    (x: number): number => 1 - Math.sqrt(1 - x ** 2), //19
    (x: number): number => (2.70158 * x - 1) * (x - 1) ** 2 + 1, //20
    (x: number): number => (2.70158 * x - 1.70158) * x ** 2, //21
    (x: number): number => ((x *= 2) < 1 ? (1 - Math.sqrt(1 - x ** 2)) : (Math.sqrt(1 - (x - 2) ** 2) + 1)) / 2, //22
    (x: number): number => x < 0.5 ? (14.379638 * x - 5.189819) * x ** 2 : (14.379638 * x - 9.189819) * (x - 1) ** 2 + 1, //23
    (x: number): number => 1 - 2 ** (-10 * x) * Math.cos(x * Math.PI / .15), //24
    (x: number): number => 2 ** (10 * (x - 1)) * Math.cos((x - 1) * Math.PI / .15), //25
    (x: number): number => ((x *= 11) < 4 ? x ** 2 : x < 8 ? (x - 6) ** 2 + 12 : x < 10 ? (x - 9) ** 2 + 15 : (x - 10.5) ** 2 + 15.75) / 16, //26
    (x: number): number => 1 - PhiEditEasing[25](1 - x), //27
    (x: number): number => (x *= 2) < 1 ? PhiEditEasing[25](x) / 2 : PhiEditEasing[26](x - 1) / 2 + .5, //28
    (x: number): number => x < 0.5 ? 2 ** (20 * x - 11) * Math.sin((160 * x + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * x) * Math.sin((160 * x + 1) * Math.PI / 18) //29
];
const RePhiEditEasing = [
    (x: number): number => x,
    (x: number): number => Math.sin((x * Math.PI) / 2),
    (x: number): number => 1 - Math.cos((x * Math.PI) / 2),
    (x: number): number => 1 - (1 - x) * (1 - x),
    (x: number): number => x * x,
    (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2,
    (x: number): number => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    (x: number): number => 1 - Math.pow(1 - x, 3),
    (x: number): number => x * x * x,
    (x: number): number => 1 - Math.pow(1 - x, 4),
    (x: number): number => x * x * x * x,
    (x: number): number => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    (x: number): number => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
    (x: number): number => 1 - Math.pow(1 - x, 5),
    (x: number): number => x * x * x * x * x,
    (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
    (x: number): number => x === 0 ? 0 : Math.pow(2, 10 * x - 10),
    (x: number): number => Math.sqrt(1 - Math.pow(x - 1, 2)),
    (x: number): number => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    (x: number): number => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
    (x: number): number => 2.70158 * x * x * x - 1.70158 * x * x,
    (x: number): number => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
    (x: number): number => x < 0.5 ? (Math.pow(2 * x, 2) * ((2.594910 + 1) * 2 * x - 2.594910)) / 2 : (Math.pow(2 * x - 2, 2) * ((2.594910 + 1) * (x * 2 - 2) + 2.594910) + 2) / 2,
    (x: number): number => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
    (x: number): number => x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * ((2 * Math.PI) / 3)),
    (x: number): number => x < 1 / 2.75 ? 7.5625 * x * x : x < 2 / 2.75 ? 7.5625 * (x -= 1.5 / 2.75) * x + 0.75 : x < 2.5 / 2.75 ? 7.5625 * (x -= 2.25 / 2.75) * x + 0.9375 : 7.5625 * (x -= 2.625 / 2.75) * x + 0.984375,
    (x: number): number => 1 - RePhiEditEasing[25](1 - x),
    (x: number): number => x < 0.5 ? (1 - RePhiEditEasing[25](1 - 2 * x)) / 2 : (1 + RePhiEditEasing[25](2 * x - 1)) / 2
];
export {
    RePhiEditEasing,
    PhiEditEasing
}