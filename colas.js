
const tomarInputs = () => {
    const x = parseFloat(document.getElementById("time-sim").value);
    const n = parseInt(document.getElementById("n").value);
    const desde = parseInt(document.getElementById("sim-desde").value);
    const hasta = parseInt(document.getElementById("sim-hasta").value);
    if (x < 1 || n < 1 || desde < 0 || hasta < 0)
        return alert("X, N, DESDE, HASTA: los valores deben ser mayores a 0.");
    if (isNaN(x) || isNaN(n) || isNaN(desde) || isNaN(hasta))
        return alert("X/N/DESDE/HASTA: por favor, ingrese todos los datos.");
    if (!Number.isInteger(x) && !Number.isInteger(n)){
        return alert("X y N deben ser enteros");
    }

    // probabilidades tiempos trabajos
    const trab_a = parseFloat(
        document.getElementById("trab_a").value
    );
    const trab_b = parseFloat(
        document.getElementById("trab_b").value
    );
    const trab_c = parseFloat(
        document.getElementById("trab_c").value
    );
    const trab_d = parseFloat(
        document.getElementById("trab_d").value
    );
    const trab_e = parseFloat(
        document.getElementById("trab_e").value
    );
    if (
        isNaN(trab_a) ||
        isNaN(trab_b) ||
        isNaN(trab_c) ||
        isNaN(trab_d) ||
        isNaN(trab_e)
    )
        return alert("Por favor, ingrese todos los datos.");
    if (
        trab_a < 0 ||
        trab_a >= 1 ||
        trab_b < 0 ||
        trab_b >= 1 ||
        trab_c < 0 ||
        trab_c >= 1 ||
        trab_d < 0 ||
        trab_d >= 1 ||
        trab_e < 0 ||
        trab_e >= 1
    )
        return alert(
            "las probabilidades deben ser valores entre 0 y 1 (sin incluir el 1)."
        );
    if (
        +(
            trab_a +
            trab_b +
            trab_c +
            trab_d +
            trab_e
        ).toFixed(12) != 1
    )
        return alert(
            "La sumatoria de las probabilidades debe ser igual a 1."
        );

    const prob_acum_trabajos = calcularProbabilidadAcumulada([
        trab_a,
        trab_b,
        trab_c,
        trab_d,
        trab_e,
    ]);

    // Tiempos de los trabajos
    const time_trab_a = parseInt(document.getElementById("time-trab-a").value);
    const time_trab_b = parseInt(document.getElementById("time-trab-b").value);
    const time_trab_c = parseInt(document.getElementById("time-trab-c").value);
    const time_trab_d = parseInt(document.getElementById("time-trab-d").value);
    const time_trab_e = parseInt(document.getElementById("time-trab-e").value);

    if (
        isNaN(time_trab_a) ||
        isNaN(time_trab_b) ||
        isNaN(time_trab_c) ||
        isNaN(time_trab_d) ||
        isNaN(time_trab_e)
    )
        return alert("Por favor, ingrese todos los datos.");
    if (
        time_trab_a < 0 ||
        time_trab_b < 0 ||
        time_trab_c < 0 ||
        time_trab_d < 0 ||
        time_trab_e < 0
    )
        return alert("Los tiempos deben ser mayores a 0.");

    // Tiempo que se suma a los valores de los trabajos
    const distrib_trab_a = parseInt(document.getElementById("distrib-trab-a").value);
    const distrib_trab_b = parseInt(document.getElementById("distrib-trab-b").value);

    if (
        isNaN(distrib_trab_a) ||
        isNaN(distrib_trab_b)
    )
        return alert("Por favor, ingrese todos los datos.");
    if (
        distrib_trab_a < 0 ||
        distrib_trab_b < 0
    )
        return alert("Los valores de A y B deben ser mayores a 0.");

    if (distrib_trab_a >= distrib_trab_b)
        return alert("El valor de A debe ser menor al valor de B.");

    // Minutos antes y despues del trabajo de formateo
    const prim_min_trab_c = parseInt(document.getElementById("prim-min-trab-c").value);
    const ult_min_trab_c = parseInt(document.getElementById("ult-min-trab-c").value);
    if (
        isNaN(prim_min_trab_c) ||
        isNaN(ult_min_trab_c)
    )
        return alert("Por favor, ingrese todos los datos.");
    if (
        prim_min_trab_c < 0 ||
        ult_min_trab_c < 0
    )
        return alert("Los valores de los primeros y ultimos min deben ser mayores a 0.");
    if (
        (prim_min_trab_c + ult_min_trab_c) >= time_trab_c
    )
        return alert("La suma de los primeros y ultimos minutos debe ser menor al tiempo del trabajo.");

    return [
        n,
        x,
        desde,
        hasta,
        prob_acum_trabajos,
        time_trab_a,
        time_trab_b,
        time_trab_c,
        time_trab_d,
        time_trab_e,

    ];
};

const calcularProbabilidadAcumulada = (probs) => {
    let acu = 0;
    let probs_acum = [];

    for (let i = 0; i < probs.length; i++) {
        acu += probs[i];
        probs_acum[i] = acu;
    }

    return probs_acum;
};

const armarIntervalos = () => {
    let lim_inf = 0;
    let lim_sup = 0;
    let lim_superiores = [];
    let lim_inferiores = [];
    let prob_acum = 0;

    return intervalos;
}