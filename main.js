import euler from "./utils/euler";
import { generacionColas } from "/simulacion-cola.js";
import {
    calcularProbabilidadAcumulada,
    generarTrabajos,
    transformarVectorEstadoAFila,
    truncarDecimales,
} from "/utils/utils.js";

const btnSimular = document.getElementById("btnSimular");
const btnSimDelete = document.getElementById("btnSimDel");
const tdPromPermanenciaPC = document.getElementById("tdPromPermanenciaPC");
const tdPorcPCsSinAtender = document.getElementById("tdPorcPCsSinAtender");
const tdCantLlegadasPC = document.getElementById("tdCantLlegadasPC");
const tdPorcOcupT1 = document.getElementById("tdPorcOcupT1");
const tdPorcOcupT2 = document.getElementById("tdPorcOcupT2");
const tdDistFinTarea = document.getElementById("tdDistFinTarea");
const divInfo = document.getElementById("divInfo");
const eGridDiv = document.getElementById("gridVariable");

let gridOptions = {};

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
        var startTime = performance.now();

        const integracionNumerica = euler(h, t0, S0);

        const [filas, cantidad_pcs, consignas] = generacionColas(
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
        var endTime = performance.now();

        // console.log(
        //     `Tiempo de ejecución de la simulación: ${endTime - startTime}ms`
        // );

        tdPromPermanenciaPC.innerHTML =
            truncarDecimales(consignas[0], 2) + " minutos";
        tdPorcPCsSinAtender.innerHTML =
            truncarDecimales(consignas[1] * 100, 2) + "%";
        tdCantLlegadasPC.innerHTML = consignas[2];
        tdPorcOcupT1.innerHTML = truncarDecimales(consignas[3] * 100, 2) + "%";
        tdPorcOcupT2.innerHTML = truncarDecimales(consignas[4] * 100, 2) + "%";

        // transformar el arreglo de 'vectoresEstado' a objetos 'fila' para ser visualizados en la tabla
        for (let i = 0; i < filas.length; i++) {
            let fila = transformarVectorEstadoAFila(filas[i]);
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
                    field: "proximo_fin_tarea_t1",
                    headerName: "Próximo fin tarea (T1)",
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
                {
                    field: "proximo_fin_tarea_t2",
                    headerName: "Próximo fin tarea (T2)",
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
                {
                    field: "total_pc_antendidas",
                    headerName: "Total PCs atendidas",
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

const borrarTabla = () => {
    const eGridDiv = document.querySelector("#gridVariable");

    let child = eGridDiv.lastElementChild;
    while (child) {
        eGridDiv.removeChild(child);
        child = eGridDiv.lastElementChild;
    }

    divInfo.style.visibility = "hidden";
};

// Agregar los eventos a los botones
btnSimDelete.addEventListener("click", borrarTabla);
btnSimular.addEventListener("click", simular);
