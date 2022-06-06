const btnSimular = document.getElementById("btnSimular");
const btnSimDelete = document.getElementById("btnSimDel");
const tdPromPermanenciaPC = document.getElementById("tdPromPermanenciaPC");
const tdPorcPCsSinAtender = document.getElementById("tdPorcPCsSinAtender");
const tdPorcOcupT1 = document.getElementById("tdPorcOcupT1");
const tdPorcOcupT2 = document.getElementById("tdPorcOcupT2");
const divInfo = document.getElementById("divInfo");
const eGridDiv = document.getElementById("gridVariable");
const tdDistFinTarea = document.getElementById("tdDistFinTarea");

let gridOptions = {};
class Pc {
    constructor(
        indice,
        estado_pc,
        tiempo_llegada,
        trabajo,
        tiempo_fin_formateo
    ) {
        this.indice = indice;
        this.estado_pc = estado_pc;
        this.tiempo_llegada = tiempo_llegada;
        this.trabajo = trabajo;
        this.tiempo_fin_formateo = tiempo_fin_formateo;
    }
}

class Trabajo {
    constructor(prob, tiempo, nombre, abrev) {
        this.prob = prob;
        this.tiempo = tiempo;
        this.nombre = nombre;
        this.abrev = abrev;
    }
}

const tomarInputs = () => {
    const x = parseFloat(document.getElementById("time-sim").value);
    const n = parseInt(document.getElementById("n").value);
    const desde = parseInt(document.getElementById("sim-desde").value);
    const hasta = parseInt(document.getElementById("sim-hasta").value);
    if (x < 1 || n < 1 || desde < 0 || hasta < 0)
        return alert("X, N, DESDE, HASTA: los valores deben ser mayores a 0.");
    if (isNaN(x) || isNaN(n) || isNaN(desde) || isNaN(hasta))
        return alert("X/N/DESDE/HASTA: por favor, ingrese todos los datos.");
    if (!Number.isInteger(x) && !Number.isInteger(n)) {
        return alert("X y N deben ser enteros");
    }

    // probabilidades tiempos trabajos
    const trab_a = parseFloat(document.getElementById("trab-a").value);
    const trab_b = parseFloat(document.getElementById("trab-b").value);
    const trab_c = parseFloat(document.getElementById("trab-c").value);
    const trab_d = parseFloat(document.getElementById("trab-d").value);
    const trab_e = parseFloat(document.getElementById("trab-e").value);
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
    if (+(trab_a + trab_b + trab_c + trab_d + trab_e).toFixed(2) != 1)
        return alert("La sumatoria de las probabilidades debe ser igual a 1.");

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

    const tiempos_trabajos = [
        time_trab_a,
        time_trab_b,
        time_trab_c,
        time_trab_d,
        time_trab_e,
    ];

    // Tiempo que se suma a los valores de los trabajos
    const distrib_trab_a = parseInt(
        document.getElementById("distrib-trab-a").value
    );
    const distrib_trab_b = parseInt(
        document.getElementById("distrib-trab-b").value
    );

    if (isNaN(distrib_trab_a) || isNaN(distrib_trab_b))
        return alert("Por favor, ingrese todos los datos.");

    if (distrib_trab_a >= distrib_trab_b)
        return alert("El valor de A debe ser menor al valor de B.");

    tdDistFinTarea.innerHTML = `U(${distrib_trab_a}';${distrib_trab_b}')`;

    // Minutos antes y despues del trabajo de formateo
    const prim_min_trab_c = parseInt(
        document.getElementById("prim-min-trab-c").value
    );
    const ult_min_trab_c = parseInt(
        document.getElementById("ult-min-trab-c").value
    );
    if (isNaN(prim_min_trab_c) || isNaN(ult_min_trab_c))
        return alert("Por favor, ingrese todos los datos.");
    if (prim_min_trab_c < 0 || ult_min_trab_c < 0)
        return alert(
            "Los valores de los primeros y ultimos min deben ser mayores a 0."
        );
    if (prim_min_trab_c + ult_min_trab_c >= time_trab_c)
        return alert(
            "La suma de los primeros y ultimos minutos debe ser menor al tiempo del trabajo."
        );

    const trabajos = generarTrabajos(prob_acum_trabajos, tiempos_trabajos);

    return [
        n,
        x,
        desde,
        hasta,
        distrib_trab_a,
        distrib_trab_b,
        prim_min_trab_c,
        ult_min_trab_c,
        trabajos,
    ];
};

const calcularProbabilidadAcumulada = (probs) => {
    let acu = 0;
    let probs_acum = [];

    for (let i = 0; i < probs.length; i++) {
        acu += probs[i];
        acu = +acu.toFixed(2);
        probs_acum[i] = acu;
    }

    return probs_acum;
};

const generarTrabajos = (probAcum, tiempos_trabajos) => {
    let trabajos = [];
    const nombres_trabajos = [
        "Cambio placa",
        "Ampliación memoria",
        "Formateo disco",
        "Agregar CD/DVD",
        "Cambio memoria",
    ];
    const abreviaciones_trabajos = ["CP", "AM", "FD", "AC/D", "CM"];

    for (let i = 0; i < probAcum.length; i++) {
        trabajos.push(
            new Trabajo(
                probAcum[i],
                tiempos_trabajos[i],
                nombres_trabajos[i],
                abreviaciones_trabajos[i]
            )
        );
    }

    return trabajos;
};

const generarProximaLlegada = (reloj) => {
    let rnd = truncateDecimals(Math.random(), 2);
    let tiempo_entre_llegadas = generadorUniforme(30, 90, rnd);
    let proxima_llegada = truncateDecimals(tiempo_entre_llegadas + reloj, 2);

    return [rnd, tiempo_entre_llegadas, proxima_llegada];
};

const generadorUniforme = (a, b, rnd) => {
    let tiempo_proximo_evento = a + rnd * (b - a);
    return truncateDecimals(tiempo_proximo_evento, 2);
};

const generarProximoTrabajo = (trabajos) => {
    let rnd_trabajos = truncateDecimals(Math.random(), 2);
    let trabajo = obtenerTrabajo(rnd_trabajos, trabajos);
    return [rnd_trabajos, trabajo];
};

const obtenerTrabajo = (rnd, trabajos) => {
    for (let i = 0; i < trabajos.length; i++) {
        if (rnd <= trabajos[i].prob) {
            return trabajos[i];
        }
    }
};

const obtenerTrabajoPorAbreviacion = (abrev, trabajos) => {
    for (let i = 0; i < trabajos.length; i++) {
        if (abrev === trabajos[i].abrev) {
            return trabajos[i];
        }
    }
};

const generarProximoFinTarea = (distrib_trab_a, distrib_trab_b, trabajo) => {
    let rnd_fin_tarea = truncateDecimals(Math.random(), 2);
    let fin_tarea =
        generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_tarea) +
        trabajo.tiempo;

    return [rnd_fin_tarea, fin_tarea];
};

const ocuparTecnico = (reloj, fin_tarea, trabajo, tiempo_min_trab_c) => {
    let fin_tarea_t;
    if (trabajo.abrev === "FD") {
        fin_tarea_t = truncateDecimals(reloj + tiempo_min_trab_c, 2);
    } else {
        fin_tarea_t = truncateDecimals(reloj + fin_tarea, 2);
    }
    let estado_t = "Ocupado";
    let minuto_ocupacion_t = reloj;

    return [fin_tarea_t, estado_t, minuto_ocupacion_t];
};

const ocuparTecnicoEtapaFinalFormateo = (reloj, ult_min_trab_c) => {
    let fin_tarea_t = truncateDecimals(reloj + ult_min_trab_c, 2);
    let estado_t = "Ocupado";
    let minuto_ocupacion_t = reloj;

    return [fin_tarea_t, estado_t, minuto_ocupacion_t];
};

const generarPC = (nroTecnico, trabajo, reloj, fin_tarea, ult_min_trab_c) => {
    if (nroTecnico === 1 || nroTecnico === 2) {
        if (trabajo.abrev === "FD") {
            return new Pc(
                null,
                `EIF T${nroTecnico}`,
                reloj,
                trabajo.abrev,
                truncateDecimals(reloj + fin_tarea - ult_min_trab_c, 2)
            );
        } else {
            return new Pc(null, `SR T${nroTecnico}`, reloj, trabajo.abrev, "-");
        }
    } else if (trabajo.abrev === "FD") {
        return new Pc(null, "EEIF", reloj, trabajo.abrev, "-");
    } else {
        return new Pc(null, "ER", reloj, trabajo.abrev, "-");
    }
};

const obtenerPCFormateo = (pcs_formateo) => {
    // Ordenar el arreglo de PCs de formateo para obtener la PC que se ocupa primero
    pcs_formateo.sort((pc1, pc2) => {
        return pc1.tiempo_fin_formateo - pc2.tiempo_fin_formateo;
    });

    return pcs_formateo.shift();
};

const generacionColas = (
    n,
    x,
    desde,
    hasta,
    distrib_trab_a,
    distrib_trab_b,
    prim_min_trab_c,
    ult_min_trab_c,
    trabajos
) => {
    let vectorEstado = [];

    // Variables asociadas a cada elemento del vector estado
    let evento = "";
    let reloj = 0;
    let rnd_llegada = "-";
    let llegada = "-";
    let proxima_llegada = "-";
    let rnd_trabajo = "-";
    let trabajo = new Trabajo("-", "-", "-", "-");
    let rnd_fin_tarea = "-";
    let fin_tarea = "-";
    let fin_tarea_t1 = "-";
    let fin_tarea_t2 = "-";
    let estado_t1 = "Libre";
    let tiempo_ocupacion_t1 = "-";
    let estado_t2 = "Libre";
    let tiempo_ocupacion_t2 = "-";
    let cola = 0;
    let cola_formateos = 0;
    let acum_tiempo_permanencia = 0;
    let acum_pcs = 0;
    let acum_tiempo_ocupacion_t1 = 0;
    let acum_tiempo_ocupacion_t2 = 0;
    let pc = new Pc(null, "-", "-", "-", "-");

    // Variables para la parte de estadisticas
    let acum_llegadas_pc = 0;
    let total_pc_antendidas = 0;
    let prom_permanencia_equipo = 0;
    let porc_equipos_no_atendidos = 0;
    let porc_ocup_t1 = 0;
    let porc_ocup_t2 = 0;

    // Varriables auxiliares
    let vectorReloj = [];
    let pc_formateo = new Pc(null, "-", "-", "-", "-");
    let cantidad_pcs = 0;
    let pcs_formateo = [];
    let pcs = [];
    let filas = [];

    // recorrer por la cantidad de filas
    for (let i = 0; i < n; i++) {
        // esta bandera sirve para determinar si hay que agregar columnas al final de la tabla
        let existe_pc = false;

        // Evento 1: Inicio de la simulacion, generamos la proxima llegada
        if (i === 0) {
            evento = "Inicio";
            reloj = 0;

            [rnd_llegada, llegada, proxima_llegada] = generarProximaLlegada(0);
        }

        // Evento 2: llegada de la primer PC
        else if (i === 1) {
            evento = "Llegada PC";
            acum_llegadas_pc++;
            reloj = vectorEstado[5];

            // Generamos la proxima llegada de PC
            [rnd_llegada, llegada, proxima_llegada] =
                generarProximaLlegada(reloj);

            // Generamos el proximo trabajo
            [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

            // Generamos el proximo fin de tarea
            [rnd_fin_tarea, fin_tarea] = generarProximoFinTarea(
                distrib_trab_a,
                distrib_trab_b,
                trabajo
            );

            // Por defecto, el T1 es el que se ocupa primero
            pc = generarPC(1, trabajo, reloj, fin_tarea, ult_min_trab_c);

            existe_pc = true;

            [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] = ocuparTecnico(
                reloj,
                fin_tarea,
                trabajo,
                prim_min_trab_c
            );
        }

        // Evento 3 en adelante: resto de la simulacion
        else {
            pcs_formateo = [];

            pc_formateo = obtenerPCFormateo(pcs_formateo);

            // Caso 1 de 3: se da un fin formateo automatico
            if (
                typeof pc_formateo !== "undefined" &&
                (pc_formateo.tiempo_fin_formateo < proxima_llegada ||
                    proxima_llegada === "-") &&
                (pc_formateo.tiempo_fin_formateo < fin_tarea_t1 ||
                    fin_tarea_t1 === "-") &&
                (pc_formateo.tiempo_fin_formateo < fin_tarea_t2 ||
                    fin_tarea_t2 === "-")
            ) {
                evento = "Fin formateo automático";
                reloj = pc_formateo.tiempo_fin_formateo;
                vectorEstado[pc_formateo.indice + 3] = "-";

                if (estado_t1 === "Ocupado" && estado_t2 === "Ocupado") {
                    // estado se actualiza a esperando etapa fin formateo
                    vectorEstado[pc_formateo.indice] = "EEFF";

                    cola_formateos++;
                } else {
                    let estaT1Libre =
                        (estado_t1 === "Libre" && estado_t2 === "Libre") ||
                        (estado_t1 === "Libre" && estado_t2 === "Ocupado");

                    if (estaT1Libre) {
                        [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                            ocuparTecnicoEtapaFinalFormateo(
                                reloj,
                                ult_min_trab_c
                            );

                        // estado se actualiza a etapa fin formateo
                        vectorEstado[pc_formateo.indice] = "EFF T1";
                    } else {
                        [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                            ocuparTecnicoEtapaFinalFormateo(
                                reloj,
                                ult_min_trab_c
                            );

                        // estado se actualiza a etapa fin formateo
                        vectorEstado[pc_formateo.indice] = "EFF T2";
                    }

                    cola_formateos > 0 && cola_formateos--;
                }

                rnd_llegada = "-";
                llegada = "-";
                rnd_trabajo = "-";
                trabajo = new Trabajo("-", "-", "-", "-");
                rnd_fin_tarea = "-";
                fin_tarea = "-";
            }

            // Caso 2 de 3: se da una llegada de PC
            else if (
                (proxima_llegada < fin_tarea_t1 || fin_tarea_t1 === "-") &&
                (proxima_llegada < fin_tarea_t2 || fin_tarea_t2 === "-")
            ) {
                evento = "Llegada PC";
                acum_llegadas_pc++;
                reloj = vectorEstado[5];

                // Generamos la proxima llegada de PC
                [rnd_llegada, llegada, proxima_llegada] =
                    generarProximaLlegada(reloj);

                // Generamos el proximo trabajo
                [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

                // Generamos el proximo fin de tarea
                [rnd_fin_tarea, fin_tarea] = generarProximoFinTarea(
                    distrib_trab_a,
                    distrib_trab_b,
                    trabajo
                );

                if (estado_t1 === "Ocupado" && estado_t2 === "Ocupado") {
                    pc = generarPC(
                        0,
                        trabajo,
                        reloj,
                        fin_tarea,
                        ult_min_trab_c
                    );

                    if (trabajo.abrev === "FD") {
                        cola_formateos++;
                    } else {
                        // en el caso que haya 3 equipos en cola, se agrega 1 equipo al acum_pcs
                        // (son las PCs que no pueden ser atendidas en este laboratorio)
                        if (cola === 3) {
                            acum_pcs++;
                        } else {
                            cola++;
                        }
                    }
                } else {
                    let estaT1Libre =
                        (estado_t1 === "Libre" && estado_t2 === "Libre") ||
                        (estado_t1 === "Libre" && estado_t2 === "Ocupado");

                    if (estaT1Libre) {
                        pc = generarPC(
                            1,
                            trabajo,
                            reloj,
                            fin_tarea,
                            ult_min_trab_c
                        );

                        [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                            ocuparTecnico(
                                reloj,
                                fin_tarea,
                                trabajo,
                                prim_min_trab_c
                            );
                    } else {
                        pc = generarPC(
                            2,
                            trabajo,
                            reloj,
                            fin_tarea,
                            ult_min_trab_c
                        );

                        [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                            ocuparTecnico(
                                reloj,
                                fin_tarea,
                                trabajo,
                                prim_min_trab_c
                            );
                    }

                    if (trabajo.abrev === "FD") {
                        cola_formateos > 0 && cola_formateos--;
                    } else {
                        cola > 0 && cola--;
                    }
                }

                existe_pc = true;
            }

            // Caso 3 de 3: se da un fin tarea
            else if (
                fin_tarea_t1 < fin_tarea_t2 ||
                fin_tarea_t2 === "-" ||
                fin_tarea_t2 < fin_tarea_t1 ||
                fin_tarea_t1 === "-"
            ) {
                // determinamos si el fin de tarea corresponde al tecnico 1
                let esFinTareaT1 =
                    fin_tarea_t1 < fin_tarea_t2 || fin_tarea_t2 === "-";

                if (esFinTareaT1) {
                    evento = "Fin tarea T1";
                    reloj = vectorEstado[10];
                    acum_tiempo_ocupacion_t1 += truncateDecimals(
                        reloj - tiempo_ocupacion_t1,
                        2
                    );
                } else {
                    evento = "Fin tarea T2";
                    reloj = vectorEstado[11];
                    acum_tiempo_ocupacion_t2 += truncateDecimals(
                        reloj - tiempo_ocupacion_t2,
                        2
                    );
                }

                // Caso 3.1: existe alguna PC en cola de formateo
                if (cola_formateos > 0) {
                    // ocupamos al tecnico
                    if (esFinTareaT1) {
                        [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                            ocuparTecnicoEtapaFinalFormateo(
                                reloj,
                                ult_min_trab_c
                            );

                        typeof pc_formateo !== "undefined" &&
                            (vectorEstado[pc_formateo.indice] = "EFF T1");
                    } else {
                        [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                            ocuparTecnicoEtapaFinalFormateo(
                                reloj,
                                ult_min_trab_c
                            );

                        typeof pc_formateo !== "undefined" &&
                            (vectorEstado[pc_formateo.indice] = "EFF T2");
                    }

                    cola_formateos--;

                    rnd_fin_tarea = "-";
                    fin_tarea = "-";
                }

                // Caso 3.2: existe alguna PC en cola
                else if (cola > 0) {
                    // Obtenemos el trabajo a partir del atributo 'trabajo' de la PC
                    trabajo = obtenerTrabajoPorAbreviacion(
                        pc.trabajo,
                        trabajos
                    );

                    // Generamos el proximo fin de tarea
                    [rnd_fin_tarea, fin_tarea] = generarProximoFinTarea(
                        distrib_trab_a,
                        distrib_trab_b,
                        trabajo
                    );

                    // Ocupamos al tecnico correspondiente
                    if (esFinTareaT1) {
                        [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                            ocuparTecnico(
                                reloj,
                                fin_tarea,
                                trabajo,
                                ult_min_trab_c
                            );
                    } else {
                        [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                            ocuparTecnico(
                                reloj,
                                fin_tarea,
                                trabajo,
                                ult_min_trab_c
                            );
                    }

                    cola--;
                }

                // Caso 3.3: no hay ninguna PC en cola
                else {
                    // Liberamos al tecnico correspondiente
                    if (esFinTareaT1) {
                        fin_tarea_t1 = "-";
                        estado_t1 = "Libre";
                        tiempo_ocupacion_t1 = "-";
                    } else {
                        fin_tarea_t2 = "-";
                        estado_t2 = "Libre";
                        tiempo_ocupacion_t2 = "-";
                    }

                    rnd_fin_tarea = "-";
                    fin_tarea = "-";
                }

                rnd_llegada = "-";
                llegada = "-";
                rnd_trabajo = "-";
                trabajo = new Trabajo("-", "-", "-", "-");
            }

            // Actualizacion de estados de PCs
            for (let j = 22; j < vectorEstado.length; j += 4) {
                let aux = new Pc(
                    j,
                    vectorEstado[j],
                    vectorEstado[j + 1],
                    vectorEstado[j + 2],
                    vectorEstado[j + 3]
                );

                if (
                    vectorEstado[j + 3] !== "-" &&
                    vectorEstado[j + 3] !== "////"
                ) {
                    pcs_formateo.push(aux);
                } else {
                    pcs.push(aux);
                }

                // Caso A: PC esperando reparacion + fin tarea => siendo reparada
                if (
                    (vectorEstado[j] === "ER" && evento === "Fin tarea T2") ||
                    (vectorEstado[j] === "ER" && evento === "Fin tarea T1")
                ) {
                    evento === "Fin tarea T2"
                        ? (vectorEstado[j] = "SR T2")
                        : (vectorEstado[j] = "SR T1");

                    vectorEstado[j + 3] = "-";
                }

                // Caso B: PC esperando etapa inicial formateo + fin tarea => etapa inicial formateo
                else if (
                    (vectorEstado[j] === "EEIF" && evento === "Fin tarea T2") ||
                    (vectorEstado[j] === "EEIF" && evento === "Fin tarea T1")
                ) {
                    evento === "Fin tarea T2"
                        ? (vectorEstado[j] = "EIF T2")
                        : (vectorEstado[j] = "EIF T1");

                    vectorEstado[j + 3] = truncateDecimals(
                        reloj + trabajo.tiempo - ult_min_trab_c,
                        2
                    );
                }

                // Caso C: PC esperando etapa final formateo + fin tarea => etapa final formateo
                else if (
                    (vectorEstado[j] === "EEFF" && evento === "Fin tarea T2") ||
                    (vectorEstado[j] === "EEFF" && evento === "Fin tarea T1")
                ) {
                    evento === "Fin tarea T2"
                        ? (vectorEstado[j] = "EFF T2")
                        : (vectorEstado[j] = "EFF T1");

                    vectorEstado[j + 3] = "-";
                }

                // Caso D: PC etapa inicial formateo + fin tarea => formateo automatico
                else if (
                    (vectorEstado[j] === "EIF T1" &&
                        evento === "Fin tarea T1") ||
                    (vectorEstado[j] === "EIF T2" && evento === "Fin tarea T2")
                ) {
                    vectorEstado[j] = "FA";
                }

                // Caso E: (PC etapa final formateo ó PC siendo reparada) + fin tarea => destruccion
                else if (
                    (vectorEstado[j] === "EFF T1" &&
                        evento === "Fin tarea T1") ||
                    (vectorEstado[j] == "EFF T2" &&
                        evento === "Fin tarea T2") ||
                    (vectorEstado[j] === "SR T1" &&
                        evento === "Fin tarea T1") ||
                    (vectorEstado[j] == "SR T2" && evento === "Fin tarea T2")
                ) {
                    acum_tiempo_permanencia += truncateDecimals(
                        reloj - vectorEstado[j + 1],
                        2
                    );

                    total_pc_antendidas++;

                    vectorEstado[j] = "////";
                    vectorEstado[j + 1] = "////";
                    vectorEstado[j + 2] = "////";
                    vectorEstado[j + 3] = "////";
                }
            }
        }

        // Actualizacion del vectorEstado
        vectorEstado[0] = i + 1;
        vectorEstado[1] = evento;
        vectorEstado[2] = reloj;
        vectorEstado[3] = rnd_llegada;
        vectorEstado[4] = llegada;
        vectorEstado[5] = proxima_llegada;
        vectorEstado[6] = rnd_trabajo;
        vectorEstado[7] = trabajo.nombre;
        vectorEstado[8] = rnd_fin_tarea;
        vectorEstado[9] = fin_tarea;
        vectorEstado[10] = fin_tarea_t1;
        vectorEstado[11] = fin_tarea_t2;
        vectorEstado[12] = estado_t1;
        vectorEstado[13] = tiempo_ocupacion_t1;
        vectorEstado[14] = estado_t2;
        vectorEstado[15] = tiempo_ocupacion_t2;
        vectorEstado[16] = cola;
        vectorEstado[17] = cola_formateos;
        vectorEstado[18] = acum_tiempo_permanencia.toFixed(2);
        vectorEstado[19] = acum_pcs;
        vectorEstado[20] = acum_tiempo_ocupacion_t1.toFixed(2);
        vectorEstado[21] = acum_tiempo_ocupacion_t2.toFixed(2);

        // En caso que se haya creado una PC, la agregamos al final del vectorEstado
        if (existe_pc) {
            vectorEstado.push(pc.estado_pc);
            vectorEstado.push(pc.tiempo_llegada);
            vectorEstado.push(pc.trabajo);
            vectorEstado.push(pc.tiempo_fin_formateo);
            existe_pc = false;
            cantidad_pcs++;
        }

        // agregar filas desdeHasta
        if (reloj >= desde && reloj <= hasta) {
            filas.push([...vectorEstado]);
        }

        //Comparar si el reloj en cada iteracion es mayor que el x ingresado, en ese caso corta la simulacion.
        vectorReloj.push(reloj);

        if (vectorReloj[i] >= x) {
            break;
        }
    }

    // agregar ultima fila en caso que 'hasta' sea menor que la cantidad de filas
    if (hasta < vectorReloj[vectorReloj.length - 1]) {
        filas.push([...vectorEstado]);
    }

    //Consignas
    //Promedio de permanencia en el laboratorio de un equipo
    prom_permanencia_equipo = acum_tiempo_permanencia / total_pc_antendidas;
    tdPromPermanenciaPC.innerHTML =
        truncateDecimals(prom_permanencia_equipo, 2) + " minutos";

    //Porcentaje de equipos que no pueden ser atendidos en el laboratorio
    porc_equipos_no_atendidos = acum_pcs / acum_llegadas_pc;
    tdPorcPCsSinAtender.innerHTML =
        truncateDecimals(porc_equipos_no_atendidos * 100, 2) + "%";

    //Porcentaje de ocupación de los técnicos del laboratorio
    porc_ocup_t1 = acum_tiempo_ocupacion_t1 / reloj;
    porc_ocup_t2 = acum_tiempo_ocupacion_t2 / reloj;
    tdPorcOcupT1.innerHTML = truncateDecimals(porc_ocup_t1 * 100, 2) + "%";
    tdPorcOcupT2.innerHTML = truncateDecimals(porc_ocup_t2 * 100, 2) + "%";

    return [filas, cantidad_pcs];
};

/**
 * Funcion principal que se encarga de llamar a las demas funciones y mostrar los resultados en la tabla
 * @returns {void}
 */
const simular = () => {
    let tableData = [];
    let columnasPCs = [];

    borrarTabla();

    const [
        n,
        x,
        desde,
        hasta,
        distrib_trab_a,
        distrib_trab_b,
        prim_min_trab_c,
        ult_min_trab_c,
        trabajos,
    ] = tomarInputs();

    try {
        const [filas, cantidad_pcs] = generacionColas(
            n,
            x,
            desde,
            hasta,
            distrib_trab_a,
            distrib_trab_b,
            prim_min_trab_c,
            ult_min_trab_c,
            trabajos
        );

        // transformar el arreglo de 'vectoresEstado' a objetos 'fila' para ser visualizados en la tabla
        for (let i = 0; i < filas.length; i++) {
            let fila = crearFila(filas[i], cantidad_pcs);
            tableData.push(fila);
        }

        for (let i = 0; i < cantidad_pcs; i++) {
            columnasPCs.push(
                {
                    field: `estado_pc${i + 1}`,
                    headerName: `Estado (PC${i + 1})`,
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: `tiempo_llegada_pc${i + 1}`,
                    headerName: `Llegada (PC${i + 1})`,
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: `trabajo_pc${i + 1}`,
                    headerName: `Trabajo (PC${i + 1})`,
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: `tiempo_fin_formateo_pc${i + 1}`,
                    headerName: `Fin formateo automático (PC${i + 1})`,
                    maxWidth: 120,
                    suppressMenu: true,
                }
            );
        }
    } catch (error) {
        alert("Oops! Ha ocurrido un error");
        console.log(error);
    }

    let columnDefs = [
        {
            headerName: "",
            children: [
                {
                    field: "n",
                    headerName: "N",
                    maxWidth: 100,
                    suppressMenu: true,
                    pinned: "left",
                },
                {
                    field: "evento",
                    headerName: "Evento",
                    maxWidth: 215,
                    suppressMenu: true,
                    pinned: "left",
                },
                {
                    field: "reloj",
                    headerName: "Reloj (minutos)",
                    maxWidth: 100,
                    suppressMenu: true,
                    pinned: "left",
                },
            ],
        },
        {
            headerName: "Llegada PC",
            children: [
                {
                    field: "rnd_llegada",
                    headerName: "RND llegada",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "llegada",
                    headerName: "Llegada",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "proxima_llegada",
                    headerName: "Próxima llegada",
                    maxWidth: 100,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "Trabajo",
            children: [
                {
                    field: "rnd_trabajo",
                    headerName: "RND trabajo",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "trabajo",
                    headerName: "Trabajo",
                    maxWidth: 150,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "Fin tarea",
            children: [
                {
                    field: "rnd_fin_tarea",
                    headerName: "RND fin tarea",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "fin_tarea",
                    headerName: "Tiempo fin tarea",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "proximo_fin_tarea_t1",
                    headerName: "Próximo fin tarea (T1)",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "proximo_fin_tarea_t2",
                    headerName: "Próximo fin tarea (T2)",
                    maxWidth: 110,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "Técnicos",
            children: [
                {
                    field: "estado_t1",
                    headerName: "Estado (T1)",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "tiempo_ocupacion_t1",
                    headerName: "Tiempo ocupación (T1)",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "estado_t2",
                    headerName: "Estado (T2)",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "tiempo_ocupacion_t2",
                    headerName: "Tiempo ocupación (T2)",
                    maxWidth: 100,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "",
            children: [
                {
                    field: "cola",
                    headerName: "Cola PCs",
                    maxWidth: 70,
                    suppressMenu: true,
                },
                {
                    field: "cola_formateos",
                    headerName: "Cola PCs formateos",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_permanencia",
                    headerName: "Acum tiempo permanencia PC",
                    maxWidth: 120,
                    suppressMenu: true,
                },
                {
                    field: "acum_pcs",
                    headerName: "Acum PCs sin revisión",
                    maxWidth: 120,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_ocupacion_t1",
                    headerName: "Acum tiempo ocupación T1",
                    maxWidth: 120,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_ocupacion_t2",
                    headerName: "Acum tiempo ocupación T2",
                    maxWidth: 120,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "Computadoras",
            children: columnasPCs,
        },
    ];

    gridOptions = {
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
        },
        columnDefs,
        groupHeaderHeight: 50,
        headerHeight: 100,
        rowData: tableData,
    };

    new agGrid.Grid(eGridDiv, gridOptions);

    // setea el tamaño de las columnas para que se adapten al ancho del encabezado de columna
    const allColumnIds = [];
    gridOptions.columnApi.getAllColumns().forEach((column) => {
        allColumnIds.push(column.getId());
    });
    gridOptions.columnApi.autoSizeColumns(allColumnIds);

    divInfo.style.visibility = "visible";
};

/**
 * Funcion para truncar un numero a una cantidad de decimales, ambos pasados como parametros
 * @param {number} number numero a truncar
 * @param {number} digits cantidad de decimales a truncar
 * @returns {number} numero truncado
 */
const truncateDecimals = (number, digits) => {
    const multiplier = Math.pow(10, digits);
    return Math.trunc(number * multiplier) / multiplier;
};

/**
 * Funcion que se encarga de borrar la tabla
 */
const borrarTabla = () => {
    const eGridDiv = document.querySelector("#gridVariable");

    let child = eGridDiv.lastElementChild;
    while (child) {
        eGridDiv.removeChild(child);
        child = eGridDiv.lastElementChild;
    }

    divInfo.style.visibility = "hidden";
};

/**
 * Funcion que crea un objeto 'fila' a partir de un vectorEstado. Este objeto son los datos para la tabla
 * @param {Array} vectorEstado[] arreglo de 'vectorEstado'
 * @returns un objeto 'fila'
 */
const crearFila = (vectorEstado) => {
    let aux = {};
    let fila = {
        n: vectorEstado[0],
        evento: vectorEstado[1],
        reloj: vectorEstado[2],
        rnd_llegada: vectorEstado[3],
        llegada: vectorEstado[4],
        proxima_llegada: vectorEstado[5],
        rnd_trabajo: vectorEstado[6],
        trabajo: vectorEstado[7],
        rnd_fin_tarea: vectorEstado[8],
        fin_tarea: vectorEstado[9],
        proximo_fin_tarea_t1: vectorEstado[10],
        proximo_fin_tarea_t2: vectorEstado[11],
        estado_t1: vectorEstado[12],
        tiempo_ocupacion_t1: vectorEstado[13],
        estado_t2: vectorEstado[14],
        tiempo_ocupacion_t2: vectorEstado[15],
        cola: vectorEstado[16],
        cola_formateos: vectorEstado[17],
        acum_tiempo_permanencia: vectorEstado[18],
        acum_pcs: vectorEstado[19],
        acum_tiempo_ocupacion_t1: vectorEstado[20],
        acum_tiempo_ocupacion_t2: vectorEstado[21],
    };

    if (vectorEstado.length >= 22) {
        let numero_pc = 0;
        for (let i = 22; i < vectorEstado.length; i += 4) {
            numero_pc++;
            aux[`estado_pc${numero_pc}`] = vectorEstado[i];
            aux[`tiempo_llegada_pc${numero_pc}`] = vectorEstado[i + 1];
            aux[`trabajo_pc${numero_pc}`] = vectorEstado[i + 2];
            aux[`tiempo_fin_formateo_pc${numero_pc}`] = vectorEstado[i + 3];
        }
        fila = { ...fila, ...aux };
    }

    return fila;
};

// Agregar los eventos a los botones
btnSimDelete.addEventListener("click", borrarTabla);
btnSimular.addEventListener("click", simular);
