
const tomarInputs = () => {
    const x = parseFloat(document.getElementById("time-sim").value);
    const n = parseInt(document.getElementById("n").value);
    const desde = parseInt(document.getElementById("sim-desde").value);
    const hasta = parseInt(document.getElementById("sim-hasta").value);
    if (x < 1 || n < 1 || desde < 0 || hasta < 0)
        return alert("X, N, DESDE, HASTA: los valores deben ser mayores a 0.");
    if (isNaN(x) || isNaN(n) || isNaN(desde) || isNaN(hasta))
        return alert("X/N/DESDE/HASTA: por favor, ingrese todos los datos.");
    if (Number.isInteger(x) && Number.isInteger(n)){
        //no hace nada
    }
    else{
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

    // TODO: validar los inputs faltantes

    return [
        n,
        x,
        desde,
        hasta,
        prob_acum_trabajos,

    ];
};