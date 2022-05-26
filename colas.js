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
    console.log(probs_acum);
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

// Obtenemos el trabajo que se va a realizar
const obtenerTrabajo = (rnd, trabajos) => {
    for (let i = 0; i < trabajos.length; i++) {
        if (rnd <= trabajos[i].prob) {
            return trabajos[i].nombre;
        }
    }
};

const generadorUniforme = (a, b, rnd) => {
    let tiempo_proximo_evento = a + rnd * (b - a);
    return truncateDecimals(tiempo_proximo_evento, 2);
};

const determinarTiempoFinReparacionPC = (rnd, trabajo) => {
    return trabajo.tiempo;
    
};

const determinarTiempoLlegada = (rnd, trabajos) => {
    for (let i = 0; i < trabajos.length; i++) {
        if (rnd <= trabajos[i].prob) {
            return trabajos[i].tiempo;
        }
    }
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
    vectorEstado[15] = 0
    vectorEstado[16] = 0
    vectorEstado[17] = 0
    vectorEstado[18] = 0

    // recorrer por la cantidad de filas
    // TODO: Ver que puede cortar antes, si llega al valor de X!!!!!!!!!!!!!!!!!!!!!!
    // for (let i = 0; i < n; i++) {
    for (let i = 0; i < 2; i++) {

        if (i === 0) {
            rnd_llegada = truncateDecimals(Math.random(), 2);
            tiempo_entre_llegadas = generadorUniforme(30, 90, rnd_llegada);
            proxima_llegada = tiempo_entre_llegadas;

            vectorEstado[0] = "Inicio";
            vectorEstado[1] = 0;
            vectorEstado[2] = rnd_llegada;
            vectorEstado[3] = tiempo_entre_llegadas;
            vectorEstado[4] = proxima_llegada;
        }
        else {
            // validamos cuál es el evento que llega primero.
            // TODO: Debemos preguntar si dos eventos llegan al mismo tiempo, cuál se debe tomar primero

            if (vectorEstado[4] < vectorEstado[9] || vectorEstado[9] === "") {
                if (vectorEstado[4] < vectorEstado[10] || vectorEstado[10] === "") {
                    // TODO: Debemos recorrer las computadoras y validar cuál es el evento que llega primero.

                    reloj = vectorEstado[4];
                    rnd_llegada = truncateDecimals(Math.random(), 2);
                    tiempo_entre_llegadas = generadorUniforme(30, 90, rnd_llegada);
                    proxima_llegada = tiempo_entre_llegadas + reloj;

                    //Debemos tirar un rnd para ver a que trabajo pertenece la llegada de la PC
                    rnd_trabajo = truncateDecimals(Math.random(), 2);
                    trabajo = obtenerTrabajo(rnd_trabajo, trabajos);

                    //Trabajamos con el fin de reparacion del trabajo
                    rnd_fin_reparacion = truncateDecimals(Math.random(), 2);
                    fin_reparacion = generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_reparacion) + 50; //!!!!!Trunque el 50. Hay que obtener el tiempo del trabajo.

                    let aux = [];
                    [aux, colaTrabajos] = validarTecnicoTomaTrabajo([...vectorEstado], colaTrabajos, reloj);

                    vectorEstado[0] = "Llegada computadora";
                    vectorEstado[1] = reloj;
                    vectorEstado[2] = rnd_llegada;
                    vectorEstado[3] = tiempo_entre_llegadas;
                    vectorEstado[4] = proxima_llegada;
                    vectorEstado[5] = rnd_trabajo;
                    vectorEstado[6] = trabajo;
                    vectorEstado[7] = rnd_fin_reparacion;
                    vectorEstado[8] = fin_reparacion;
                    vectorEstado[11] = aux[11];
                    vectorEstado[12] = aux[12];
                    vectorEstado[13] = aux[13];
                    vectorEstado[14] = aux[14];
                }
            }
            else if (vectorEstado[9] < vectorEstado[10] || vectorEstado[10] === "") {
                // TODO: Debemos recorrer las computadoras y validar cuál es el evento que llega primero.
                vectorEstado[0] = "Fin reparación computadora";
            }
            else {
                // TODO: Debemos recorrer las computadoras y validar cuál es el evento que llega primero.
                vectorEstado[0] = "Fin reparación computadora";
            }

            // determinar tiempo de llegada
            // llegada = determinarTiempoLlegada(rnd_llegada, trabajos);

            // proxima_llegada += llegada;

            // // generar rnd de trabajo
            // rnd_trabajo = generarRndTrabajo();

            // // determinar trabajo
            // trabajo = obtenerTrabajo(rnd_trabajo, trabajos);

            // // generar rnd fin reparacion
            // rnd_fin_reparacion = generarRndFinReparacion();

            // // determinar tiempo fin reparacion
            // fin_reparacion = determinarTiempoFinReparacion(rnd_fin_reparacion);

            // proximo_fin_reparacion_t1 += fin_reparacion;
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

const validarTecnicoTomaTrabajo = (vectorEstado, cola, reloj) => {
    // Validamos cual es el tecnico que tomará el trabajo o lo agregamos a la cola.
    if (vectorEstado[11] === "Libre" && vectorEstado[13] === "Libre") {
        let rnd_tec = truncateDecimals(Math.random(), 2);
        if (rnd_tec < 0.5) {
            vectorEstado[11] = "Ocupado";
            vectorEstado[12] = reloj;
        }
    }
    else if (vectorEstado[11] === "Libre") {
        vectorEstado[11] = "Ocupado";
        vectorEstado[12] = reloj;
    }
    else if (vectorEstado[13] === "Libre") {
        vectorEstado[13] = "Ocupado";
        vectorEstado[14] = reloj;
    }
    else cola++;

    return [vectorEstado, cola];
}

/**
 * Funcion principal que se encarga de llamar a las demas funciones y mostrar los resultados en la tabla
 * @returns {void}
 */
const simular = () => {
    let tableData = [];

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
                    maxWidth: 140,
                    suppressMenu: true,
                },
                {
                    field: "reloj",
                    headerName: "Reloj",
                    maxWidth: 140,
                    suppressMenu: true,
                },
            ]
        },
        {
            headerName: "Llegada Computadora",
            children: [
                {
                    field: "rnd_llegada",
                    headerName: "RND llegada",
                    maxWidth: 140,
                    suppressMenu: true,
                },
                {
                    field: "llegada",
                    headerName: "Tiempo llegada",
                    maxWidth: 140,
                    suppressMenu: true,
                },
                {
                    field: "proxima_llegada",
                    headerName: "Proxima llegada",
                    maxWidth: 140,
                    suppressMenu: true,
                },
            ]
        },
        {
            field: "rnd_trabajo",
            headerName: "RND trabajo",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "trabajo",
            headerName: "Trabajo",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "rnd_fin_reparacion",
            headerName: "RND fin reparacion",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "fin_reparacion",
            headerName: "Tiempo fin reparacion",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "proximo_fin_reparacion_t1",
            headerName: "Proximo fin reparacion (T1)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "proximo_fin_reparacion_t2",
            headerName: "Proximo fin reparacion (T2)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "liberacion_formateo",
            headerName: "Liberacion formateo",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "ocupacion_formateo",
            headerName: "Ocupacion formateo",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "fin_formateo_e1",
            headerName: "Tiempo fin reparacion formateo (E1)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "fin_formateo_e2",
            headerName: "Tiempo fin reparacion formateo (E2)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "estado_t1",
            headerName: "Estado (T1)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "hora_ocupacion_t2",
            headerName: "Hora ocupacion (T1)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "tiempo_remanente_t1",
            headerName: "Tiempo remanente (T1)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "estado_t2",
            headerName: "Estado (T2)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "hora_ocupacion_t2",
            headerName: "Hora ocupacion (T2)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "tiempo_remanente_t2",
            headerName: "Tiempo remanente (T2)",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "cola",
            headerName: "Cola",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "acum_tiempo_permanencia",
            headerName: "Tiempo acumulado permanencia de equipo",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "acum_equipos",
            headerName: "Cantidad equipos sin revision",
            maxWidth: 140,
            suppressMenu: true,
        },
        {
            field: "acum_tiempo_ocupacion",
            headerName: "Tiempo acumulado ocupacion de tecnicos",
            maxWidth: 140,
            suppressMenu: true,
        },
    ];

    gridRandVarOptions = {
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
        },
        columnDefs,
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
    return {
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
        liberacion_formateo: vectorEstado[11],
        ocupacion_formateo: vectorEstado[12],
        fin_formateo_e1: vectorEstado[13],
        fin_formateo_e2: vectorEstado[14],
        estado_t1: vectorEstado[15],
        hora_ocupacion_t2: vectorEstado[16],
        tiempo_remanente_t1: vectorEstado[17],
        estado_t2: vectorEstado[18],
        hora_ocupacion_t2: vectorEstado[19],
        tiempo_remanente_t2: vectorEstado[20],
        cola: vectorEstado[21],
        acum_tiempo_permanencia: vectorEstado[22],
        acum_equipos: vectorEstado[23],
        acum_tiempo_ocupacion: vectorEstado[24],
    };
};

// Agregar los eventos a los botones
btnSimDelete.addEventListener("click", borrarTabla);
btnSimular.addEventListener("click", simular);
btnExportToExcelRandVar.addEventListener("click", exportarTablaExcel);
