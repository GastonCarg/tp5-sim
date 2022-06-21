export default euler = (h, t0, S0) => {
    let t = t0;
    let S = S0;
    let dSdt;
    let result = [];

    while (S > 0) {
        dSdt = -68 - S ** 2 / S0;
        let current = [t, S, dSdt];
        t += h;
        S += h * dSdt;
        let next = [t, S];
        S > 0 && result.push([...current, ...next]);
    }

    return result;
};
