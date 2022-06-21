export default function euler(h, t0, S0) {
    let t = t0;
    let S = S0;
    let dSdt;
    let filas = [];

    while (S > 0) {
        dSdt = -68 - S ** 2 / S0;
        let current = [t, S, dSdt];
        t = Number((t + h).toFixed(2));
        S += h * dSdt;
        let next = [t, S];
        S > 0 && filas.push([...current, ...next]);
    }

    return filas;
}
