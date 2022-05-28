const btnSimular = document.getElementById("btnSimular");
const btnSimDelete = document.getElementById("btnSimDel");
const lblCasoExito = document.getElementById("casoExito");
const eGridDiv = document.getElementById("gridVariable");
const btnExportToExcelRandVar = document.getElementById(
    "btnExportToExcelRandVar"
);
let gridRandVarOptions = {};

// variable globales
const NOMBRES_TRABAJOS = [
    "Cambio de placa",
    "Ampliacion de memoria",
    "Formateo de disco",
    "Agregar CD o DVD",
    "Cambio de memoria",
];
const LETRAS_TRABAJOS = ["A", "B", "C", "D", "E"];

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
    if (+(trab_a + trab_b + trab_c + trab_d + trab_e).toFixed(12) != 1)
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
        // hago este toFixed para que se redondee a 2 decimales
        acu = +acu.toFixed(12);
        probs_acum[i] = acu;
    }

    return probs_acum;
};

// Genera una lista de trabajos con sus respectivas probabilidades
const generarTrabajos = (probAcum, tiempos_trabajos) => {
    let trabajos = [];
    let trabajo = {
        prob: 0,
        tiempo: 0,
        nombre: "",
        letra: "",
    };

    for (let i = 0; i < probAcum.length; i++) {
        trabajo = {
            prob: probAcum[i],
            tiempo: tiempos_trabajos[i],
            nombre: NOMBRES_TRABAJOS[i],
            letra: LETRAS_TRABAJOS[i],
        };
        trabajos.push(trabajo);
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

const generarProximoFinReparacion = (
    distrib_trab_a,
    distrib_trab_b,
    trabajo
) => {
    let rnd_fin_reparacion = truncateDecimals(Math.random(), 2);
    let fin_reparacion =
        generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_reparacion) +
        trabajo.tiempo;
    return [rnd_fin_reparacion, fin_reparacion];
};

/**
 *
 * @param {number} n
 * @param {number} x
 * @param {number} desde
 * @param {number} hasta
 * @param {*} distrib_trab_a
 * @param {*} distrib_trab_b
 * @param {*} prim_min_trab_c
 * @param {*} ult_min_trab_c
 * @param {*} trabajos
 * @returns
 */
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
    let rnd_llegada = 0;
    let llegada = 0;
    let proxima_llegada = 0;
    let rnd_trabajo = 0;
    let trabajo = "";
    let rnd_fin_reparacion = 0;
    let fin_reparacion = 0;
    let proximo_fin_reparacion_t1 = 0;
    let proximo_fin_reparacion_t2 = 0;
    let tiempo_entre_llegadas = "";
    let reloj = 0;
    let colaTrabajos = 0;
    let colaFormateos = [];
    let acum_tiempo_ocupacion = 0;

    let filas = [];

    /*
    vectorEstado[0] = evento
    vectorEstado[1] = reloj
    vectorEstado[2] = rnd_llegada
    vectorEstado[3] = tiempo_entre_llegadas
    vectorEstado[4] = proxima_llegada
    vectorEstado[5] = rnd_trabajo
    vectorEstado[6] = trabajo
    vectorEstado[7] = rnd_fin_reparacion
    vectorEstado[8] = tiempo_fin_reparacion
    vectorEstado[9] = fin_reparacion_t1
    vectorEstado[10] = fin_reparacion_t2
    vectorEstado[11] = estado_t1
    vectorEstado[12] = hora_ocupacion_t1
    vectorEstado[13] = estado_t2
    vectorEstado[14] = hora_ocupacion_t2
    vectorEstado[15] = cola
    vectorEstado[16] = acum_tiempo_permanencia
    vectorEstado[17] = acum_equipos
    vectorEstado[18] = acum_tiempo_ocupacion
    */
    const vectorEstado = new Array();
    vectorEstado[0] = "";
    vectorEstado[1] = 0;
    vectorEstado[2] = "";
    vectorEstado[3] = "";
    vectorEstado[4] = "";
    vectorEstado[5] = "";
    vectorEstado[6] = "";
    vectorEstado[7] = "";
    vectorEstado[8] = "";
    vectorEstado[9] = "";
    vectorEstado[10] = "";
    vectorEstado[11] = "Libre";
    vectorEstado[12] = "";
    vectorEstado[13] = "Libre";
    vectorEstado[14] = "";
    vectorEstado[15] = 0;
    vectorEstado[16] = 0;
    vectorEstado[17] = 0;
    vectorEstado[18] = 0;

    // recorrer por la cantidad de filas
    // TODO: Ver que puede cortar antes, si llega al valor de X!!!!!!!!!!!!!!!!!!!!!!
    // for (let i = 0; i < n; i++) {
    for (let i = 0; i < 4; i++) {
        if (i === 0) {
            [rnd_llegada, tiempo_entre_llegadas, proxima_llegada] =
                generarProximaLlegada(0);

            vectorEstado[0] = "Inicio";
            vectorEstado[1] = 0;
            vectorEstado[2] = rnd_llegada;
            vectorEstado[3] = tiempo_entre_llegadas;
            vectorEstado[4] = proxima_llegada;
        } else {
            // validamos cuál es el evento que llega primero.
            // TODO: Debemos preguntar si dos eventos llegan al mismo tiempo, cuál se debe tomar primero

            // llegada de una computadora
            // vectorEstado[4] = proxima_llegada
            // vectorEstado[9] = fin_reparacion_t1
            // vectorEstado[10] = fin_reparacion_t2
            let prox_llegada_menor =
                (vectorEstado[4] < vectorEstado[9] || vectorEstado[9] === "") &&
                (vectorEstado[4] < vectorEstado[10] || vectorEstado[10] === "");
            let prox_fin_rep_menor =
                vectorEstado[9] < vectorEstado[10] || vectorEstado[10] === "";
            if (prox_llegada_menor) {
                reloj = vectorEstado[4];

                // TODO: Esto lo dejo comentado hasta que hagamos funcionar bien el tema de los trabajos
                // if (vectorEstado.length > 19) {
                //     for (let j = 19; j < vectorEstado.length; j+=4) {
                //         // Para el caso de la liberacion del tecnico para el trabajo de formateo
                //         if (vectorEstado[j+2] !== "" && vectorEstado[4] < vectorEstado[j+2] && vectorEstado[4] < vectorEstado[j+3]) {
                //             continue;
                //         }
                //         else {
                //             // TODO: Acá deberíamos hacer las validaciones con respecto a los tiempos de reparación de los equipos??
                //         }
                //     }
                // }

                // Generamos la proxima llegada de computadora
                [rnd_llegada, tiempo_entre_llegadas, proxima_llegada] =
                    generarProximaLlegada(reloj);

                // Generamos el proximo trabajo
                [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

                // Generamos el proximo fin de reparacion
                [rnd_fin_reparacion, fin_reparacion] =
                    generarProximoFinReparacion(
                        distrib_trab_a,
                        distrib_trab_b,
                        trabajo
                    );

                // Preguntamos cual servidor esta libre
                let aux = [];
                [aux, colaTrabajos] = validarTecnicoTomaTrabajo(
                    [...vectorEstado],
                    colaTrabajos,
                    reloj,
                    fin_reparacion
                );

                proximo_fin_reparacion_t1 = aux[9];
                proximo_fin_reparacion_t2 = aux[10];

                if (trabajo.letra === "C") {
                    // TODO: Ver cómo hacer para obtener el tiempo de ocupacion del tecnico!!!
                    // debemos saber qué tecnico lo toma para saber cuál pasarle
                    // yo lo dejo hardcodeado con el tecnico 1
                    let trabFormateo = {
                        estado: "Tomado tecnico inicio",
                        hora_llegada: reloj,
                        liberacion_tecnico: reloj + prim_min_trab_c,
                        ocupacion_tecnico:
                            proximo_fin_reparacion_t1 - ult_min_trab_c,
                    };
                    colaFormateos.push(trabFormateo);
                    // pusheamos al colaFormateos el trabajo
                    console.log("cola formateos", colaFormateos);
                }

                vectorEstado[0] = "Llegada computadora";
                vectorEstado[1] = reloj;
                vectorEstado[2] = rnd_llegada;
                vectorEstado[3] = tiempo_entre_llegadas;
                vectorEstado[4] = proxima_llegada;
                vectorEstado[5] = rnd_trabajo;
                vectorEstado[6] = trabajo.nombre;
                vectorEstado[7] = rnd_fin_reparacion;
                vectorEstado[8] = fin_reparacion;
                vectorEstado[9] = proximo_fin_reparacion_t1;
                vectorEstado[10] = proximo_fin_reparacion_t2;
                vectorEstado[11] = aux[11];
                vectorEstado[12] = aux[12];
                vectorEstado[13] = aux[13];
                vectorEstado[14] = aux[14];
                vectorEstado[15] = aux[15];
                vectorEstado[17] = aux[17];
            }
            // fin de reparacion de una computadora por el tecnico 1
            else if (prox_fin_rep_menor) {
                // TODO: Debemos recorrer las computadoras y validar cuál es el evento que llega primero.
                acum_tiempo_ocupacion += vectorEstado[1] - vectorEstado[12];

                vectorEstado[0] = "Fin reparación computadora";
                vectorEstado[1] = vectorEstado[9];
                vectorEstado[2] = "";
                vectorEstado[3] = "";
                vectorEstado[5] = "";
                vectorEstado[6] = "";
                vectorEstado[7] = "";
                vectorEstado[8] = "";
                vectorEstado[9] = "";
                vectorEstado[12] = "";
                vectorEstado[18] = acum_tiempo_ocupacion;
            }
            // fin de reparacion de una computadora por el tecnico 2
            else {
                console.log("Entró al 2do tecnico!!");
                // TODO: Debemos recorrer las computadoras y validar cuál es el evento que llega primero.
                reloj = vectorEstado[1];

                // if (colaFormateos.length > 0) {
                if (colaFormateos.length > 1000) {
                    // obtenemos el próximo trabajo de formateo
                    let trabajoFormateo = colaFormateos.shift();
                    vectorEstado[1] = reloj + ult_min_trab_c;
                } else if (colaTrabajos > 0) {
                    // Debemos generar un rnd para ver que trabajo debe realizar el tecnico
                    [rnd_trabajo, rnd_fin_reparacion, trabajo, fin_reparacion] =
                        generarProximoTrabajo(
                            trabajos,
                            distrib_trab_a,
                            distrib_trab_b
                        );

                    vectorEstado[5] = rnd_trabajo;
                    vectorEstado[6] = trabajo.nombre;
                    vectorEstado[7] = rnd_fin_reparacion;
                    vectorEstado[8] = fin_reparacion;
                    vectorEstado[10] = reloj + fin_reparacion;
                    vectorEstado[14] = vectorEstado[14];
                } else {
                    acum_tiempo_ocupacion += vectorEstado[1] - vectorEstado[14];

                    vectorEstado[13] = "Libre";
                    vectorEstado[5] = "";
                    vectorEstado[6] = "";
                    vectorEstado[7] = "";
                    vectorEstado[8] = "";
                    vectorEstado[9] = "";
                    vectorEstado[10] = "";
                    vectorEstado[14] = "";
                    vectorEstado[18] = acum_tiempo_ocupacion;
                }

                vectorEstado[0] = "Fin reparación computadora";
                vectorEstado[1] = vectorEstado[10];
                vectorEstado[2] = "";
                vectorEstado[3] = "";
            }
        }

        // agregar filas desdeHasta
        if (i + 1 >= desde && i + 1 <= hasta) {
            filas.push([...vectorEstado]);
        }
    }

    // agregar ultima fila en caso que 'hasta' sea menor que la cantidad de filas
    if (hasta < n) {
        filas.push([...vectorEstado]);
    }
    return filas;
};

const validarTecnicoTomaTrabajo = (
    vectorEstado,
    cola,
    reloj,
    fin_reparacion
) => {
    let fin_reparacion_t1 = vectorEstado[9];
    let fin_reparacion_t2 = vectorEstado[10];
    let estado_t1 = vectorEstado[11];
    let hora_ocupacion_t1 = vectorEstado[12];
    let estado_t2 = vectorEstado[13];
    let hora_ocupacion_t2 = vectorEstado[14];
    let acum_equipos = vectorEstado[17];

    // Validamos cual es el tecnico que tomará el trabajo o lo agregamos a la cola.
    if (estado_t1 === "Libre" && estado_t2 === "Libre") {
        let rnd_tec = truncateDecimals(Math.random(), 2);
        // TODO: SACAR ESTO!!!!
        rnd_tec = 0.8;
        if (rnd_tec < 0.5) {
            fin_reparacion_t1 = truncateDecimals(reloj + fin_reparacion, 2);
            estado_t1 = "Ocupado";
            hora_ocupacion_t1 = reloj;
        } else {
            fin_reparacion_t2 = reloj + fin_reparacion;
            estado_t2 = "Ocupado";
            vectorEstado[14] = reloj;
        }
    } else if (estado_t1 === "Libre" && estado_t2 === "Ocupado") {
        fin_reparacion_t1 = truncateDecimals(reloj + fin_reparacion, 2);
        estado_t1 = "Ocupado";
        hora_ocupacion_t1 = reloj;
    } else if (estado_t1 === "Ocupado" && estado_t2 === "Libre") {
        fin_reparacion_t2 = truncateDecimals(reloj + fin_reparacion, 2);
        estado_t2 = "Ocupado";
        hora_ocupacion_t2 = reloj;
    } else {
        if (cola === 3) {
            acum_equipos += 1;
        } else {
            cola++;
            vectorEstado[15] = cola;
        }
    }

    return [vectorEstado, cola];
};

const determinarProxFinReparacionTecnico = () => {};

/**
 * Funcion principal que se encarga de llamar a las demas funciones y mostrar los resultados en la tabla
 * @returns {void}
 */
const simular = () => {
    let tableData = [];
    // let dinamycsFields = [];

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
        const filas = generacionColas(
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
        console.log(filas);
        // transformar el arreglo de 'vectoresEstado' a objetos 'fila' para ser visualizados en la tabla
        filas.map((fila) => tableData.push(crearFila(fila)));
    } catch (error) {
        alert("Oops! Ha ocurrido un error");
        console.log(error);
    }

    let columnDefs = [
        {
            headerName: "",
            children: [
                {
                    field: "evento",
                    headerName: "Evento",
                    maxWidth: 200,
                    suppressMenu: true,
                },
                {
                    field: "reloj",
                    headerName: "Reloj",
                    maxWidth: 100,
                    suppressMenu: true,
                },
            ],
        },
        {
            headerName: "Llegada computadora",
            children: [
                {
                    field: "rnd_llegada",
                    headerName: "RND llegada",
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: "llegada",
                    headerName: "Tiempo llegada",
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
            headerName: "Fin reparación computadora",
            children: [
                {
                    field: "rnd_fin_reparacion",
                    headerName: "RND fin reparación",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "fin_reparacion",
                    headerName: "Tiempo fin reparación",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "proximo_fin_reparacion_t1",
                    headerName: "Próximo fin reparación (T1)",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "proximo_fin_reparacion_t2",
                    headerName: "Próximo fin reparación (T2)",
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
                    field: "hora_ocupacion_t1",
                    headerName: "Hora ocupación (T1)",
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
                    field: "hora_ocupacion_t2",
                    headerName: "Hora ocupación (T2)",
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
                    headerName: "Cola",
                    maxWidth: 70,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_permanencia",
                    headerName: "Tiempo acumulado permanencia de equipo",
                    maxWidth: 120,
                    suppressMenu: true,
                },
                {
                    field: "acum_equipos",
                    headerName: "Cantidad equipos sin revisión",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_ocupacion",
                    headerName: "Tiempo acumulado ocupación de técnicos",
                    maxWidth: 110,
                    suppressMenu: true,
                },
            ],
        },
    ];

    gridRandVarOptions = {
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

    new agGrid.Grid(eGridDiv, gridRandVarOptions);

    // setea el tamaño de las columnas para que se adapten al ancho del header
    const allColumnIds = [];
    gridRandVarOptions.columnApi.getAllColumns().forEach((column) => {
        allColumnIds.push(column.getId());
    });
    gridRandVarOptions.columnApi.autoSizeColumns(allColumnIds);

    btnExportToExcelRandVar.removeAttribute("hidden");
};

/**
 * Funcion que se encarga de exportar la tabla a excel
 */
const exportarTablaExcel = () => {
    gridRandVarOptions.api.exportDataAsExcel();
};

/**
 * Funcion para truncar un numero a una cantidad de decimales, ambos pasados como parametros
 * @param {number} number numero a truncar
 * @param {number} digits cantidad de decimales a truncar
 * @returns
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
};

/**
 * Funcion que crea un objeto 'fila' a partir de un vectorEstado. Este objeto son los datos para la tabla
 * @param {Array} vectorEstado[] arreglo de 'vectorEstado'
 * @returns un objeto 'fila'
 */
const crearFila = (vectorEstado) => {
    let fila = {
        evento: vectorEstado[0],
        reloj: vectorEstado[1],
        rnd_llegada: vectorEstado[2],
        llegada: vectorEstado[3],
        proxima_llegada: vectorEstado[4],
        rnd_trabajo: vectorEstado[5],
        trabajo: vectorEstado[6],
        rnd_fin_reparacion: vectorEstado[7],
        fin_reparacion: vectorEstado[8],
        proximo_fin_reparacion_t1: vectorEstado[9],
        proximo_fin_reparacion_t2: vectorEstado[10],
        estado_t1: vectorEstado[11],
        hora_ocupacion_t1: vectorEstado[12],
        estado_t2: vectorEstado[13],
        hora_ocupacion_t2: vectorEstado[14],
        cola: vectorEstado[15],
        acum_tiempo_permanencia: vectorEstado[16],
        acum_equipos: vectorEstado[17],
        acum_tiempo_ocupacion: vectorEstado[18],
    };

    if (vectorEstado.length > 19) {
        for (let i = 19; i < vectorEstado.length; i += 4) {
            fila = {
                ...fila,
                estado_pc: vectorEstado[i],
                hora_ocupacion: vectorEstado[i + 1],
                liberacion_tecnico: vectorEstado[i + 2],
                ocupacion_tecnico: vectorEstado[i + 3],
            };
        }
    }

    return fila;
};

// Agregar los eventos a los botones
btnSimDelete.addEventListener("click", borrarTabla);
btnSimular.addEventListener("click", simular);
btnExportToExcelRandVar.addEventListener("click", exportarTablaExcel);
