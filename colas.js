const btnSimular = document.getElementById("btnSimular");
const btnSimDelete = document.getElementById("btnSimDel");
const lblPromPermanenciaUnEquipo = document.getElementById("promPermanencia");
const lblPorcEquiposSinAtender = document.getElementById("porcSinAtender");
const lblPorcOcupTecnico = document.getElementById("porcOcup");
const eGridDiv = document.getElementById("gridVariable");
const btnExportToExcelRandVar = document.getElementById(
    "btnExportToExcelRandVar"
);
let gridOptions = {};

// variable globales
const NOMBRES_TRABAJOS = [
    "Cambio placa",
    "Ampliación memoria",
    "Formateo disco",
    "Agregar CD/DVD",
    "Cambio memoria",
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
        acu = +acu.toFixed(2);
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

const generarProximoFinTarea = (
    distrib_trab_a,
    distrib_trab_b,
    trabajo,
    reloj,
    prim_min_trab_c
) => {
    let rnd_fin_tarea = truncateDecimals(Math.random(), 2);
    let fin_tarea;

    if (trabajo.letra === "C") {
        rnd_fin_tarea = "-";
        fin_tarea = reloj + prim_min_trab_c;
    } else {
        fin_tarea =
            generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_tarea) +
            trabajo.tiempo;
    }

    return [rnd_fin_tarea, fin_tarea];
};

const ocuparTecnico = (reloj, fin_tarea, trabajo, ult_min_trab_c) => {
    let fin_tarea_t;
    if (trabajo.letra === "C") {
        fin_tarea_t = reloj + ult_min_trab_c;
    } else {
        fin_tarea_t = truncateDecimals(reloj + fin_tarea, 2);
    }
    let estado_t = "Ocupado";
    let minuto_ocupacion_t = reloj;

    return [fin_tarea_t, estado_t, minuto_ocupacion_t];
};

const generarPC = (
    nroTecnico,
    trabajo,
    reloj,
    fin_tarea,
    ult_min_trab_c,
    prim_min_trab_c,
    distrib_trab_a,
    distrib_trab_b
) => {
    let pc;
    let rnd_fin_tarea_formateo = 0;
    if (nroTecnico === 1) {
        if (trabajo.letra === "C") {
            pc = {
                estado_pc: "Iniciando formateo x tec1",
                tiempo_llegada: reloj,
                tiempo_fin_formateo: truncateDecimals(generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_tarea_formateo) + reloj + trabajo.tiempo - ult_min_trab_c, 2),
            };
        } else {
            pc = {
                estado_pc: "Siendo reparada x tec1",
                tiempo_llegada: reloj,
                tiempo_fin_formateo: "-",
            };
        }
    } 
    else if (nroTecnico === 2){
        if (trabajo.letra === "C") {
            pc = {
                estado_pc: "Iniciando formateo x tec2",
                tiempo_llegada: reloj,
                tiempo_fin_formateo: truncateDecimals(generadorUniforme(distrib_trab_a, distrib_trab_b, rnd_fin_tarea_formateo) + reloj + trabajo.tiempo - ult_min_trab_c, 2),
            };
        } else {
            pc = {
                estado_pc: "Siendo reparada x tec2",
                tiempo_llegada: reloj,
                tiempo_fin_formateo: "-",
            };
        }
    }
    else {
        pc = {
            estado_pc: "Esperando reparación",
            tiempo_llegada: reloj,
            tiempo_fin_formateo: "-",
        };
    }

    return pc;
};


/**
 *
 * @param {number} n
 * @param {number} x
 * @param {number} desde
 * @param {number} hasta
 * @param {number} distrib_trab_a
 * @param {number} distrib_trab_b
 * @param {number} prim_min_trab_c
 * @param {number} ult_min_trab_c
 * @param {Array} trabajos
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
    let evento = "";
    let reloj = 0;
    let rnd_llegada = "-";
    let llegada = "-";
    let proxima_llegada = "-";
    let rnd_trabajo = "-";
    let trabajo = {
        prob: "-",
        tiempo: "-",
        nombre: "-",
        letra: "-",
    };
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
    let pc = {
        estado_pc: "-",
        tiempo_llegada: "-",
        tiempo_fin_formateo: "-",
    };
    let filas = [];

    let vectorEstado = [];
    let vectorReloj = [];
    let acum_llegadas_pc = 0; //para Estadistica
    let total_pc_antendidas = 0; //para Estadistica.
    let prom_permanencia_equipo = 0; //para Estadistica
    let porc_equipos_no_atendidos = 0; //para Estadistica
    let porc_ocup_tecnico1 = 0; //para Estadistica
    let porc_ocup_tecnico2 = 0; //para Estadistica
 
    // contador para saber la cantidad de objetos PC que se crearon
    let cantidad_pcs = 0;

    // recorrer por la cantidad de filas
    // TODO: Ver que puede cortar antes, si llega al valor de X!!!!!!!!!!!!!!!!!!!!!! OK ESTO
    for (let i = 0; i < n; i++) {
        // esta bandera sirve para determinar si hay que agregar columnas al final de la tabla
        let existe_pc = false;
        if (i === 0) {
            evento = "Inicio";
            reloj = 0;

            [rnd_llegada, llegada, proxima_llegada] = generarProximaLlegada(0);
        } else {
            // validamos cuál es el evento que llega primero.
            // Caso 1 de 4: llegada de PC
            if (
                (proxima_llegada < fin_tarea_t1 || fin_tarea_t1 === "-") &&
                (proxima_llegada < fin_tarea_t2 || fin_tarea_t2 === "-")
            ) {
                evento = "Llegada PC";
                acum_llegadas_pc += 1;
                reloj = vectorEstado[5];

                // Generamos la proxima llegada de PC
                [rnd_llegada, llegada, proxima_llegada] =
                    generarProximaLlegada(reloj);

                // en caso que ambos tecnicos NO esten ocupados, se genera el proximo trabajo
                if (!(estado_t1 === "Ocupado" && estado_t2 === "Ocupado")) {
                    // Generamos el proximo trabajo
                    [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

                    // Generamos el proximo fin de tarea
                    [rnd_fin_tarea, fin_tarea, pc] = generarProximoFinTarea(
                        distrib_trab_a,
                        distrib_trab_b,
                        trabajo,
                        reloj,
                        prim_min_trab_c
                    );                    
                

                }

                // Validamos cual es el tecnico que tomará el trabajo. Lo va a tomar siempre el T1.
                if (estado_t1 === "Libre" && estado_t2 === "Libre") {
                    pc = generarPC(
                        1,
                        trabajo,
                        reloj,
                        fin_tarea,
                        ult_min_trab_c,
                        prim_min_trab_c,
                        distrib_trab_a,
                        distrib_trab_b
                    );
                    existe_pc = true;

                    [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                        ocuparTecnico(
                            reloj,
                            fin_tarea,
                            trabajo,
                            ult_min_trab_c
                        );
                    
                    cola > 0 && cola--;
                    
                } else if (estado_t1 === "Libre" && estado_t2 === "Ocupado") {
                    // Generamos el objeto PC
                    pc = generarPC(
                        1,
                        trabajo,
                        reloj,
                        fin_tarea,
                        ult_min_trab_c,
                        prim_min_trab_c,
                        distrib_trab_a,
                        distrib_trab_b
                    );

                    existe_pc = true;

                    [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                        ocuparTecnico(
                            reloj,
                            fin_tarea,
                            trabajo,
                            ult_min_trab_c
                        );
                    

                    cola > 0 && cola--;

                } else if (estado_t1 === "Ocupado" && estado_t2 === "Libre") {

                    // Generamos el objeto PC
                    pc = generarPC(
                        2,
                        trabajo,
                        reloj,
                        fin_tarea,
                        ult_min_trab_c,
                        prim_min_trab_c,
                        distrib_trab_a,
                        distrib_trab_b
                    );
                    existe_pc = true;

                    [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                        ocuparTecnico(
                            reloj,
                            fin_tarea,
                            trabajo,
                            ult_min_trab_c
                        );

                    cola > 0 && cola--;
                }
                // En caso que los dos tecnicos esten ocupados, incrementamos la cola.
                else {
                    // Generamos el objeto PC
                    pc = generarPC(
                        "-",
                        trabajo,
                        reloj,
                        fin_tarea,
                        ult_min_trab_c,
                        prim_min_trab_c,
                        distrib_trab_a,
                        distrib_trab_b
                    );

                    existe_pc = true;
                    

                    // No generamos el proximo trabajo, ni el proximo fin de tarea
                    rnd_trabajo = "-";
                    trabajo = {
                        prob: "-",
                        tiempo: "-",
                        nombre: "-",
                        letra: "-",
                    };
                    rnd_fin_tarea = "-";
                    fin_tarea = "-";

                    // en el caso que haya 3 equipos en cola, se agrega 1 equipo al acum_pcs
                    // (son las PCs que no pueden ser atendidas en este laboratorio)
                    if (cola === 3) {
                        acum_pcs++;
                    } else {
                        cola++;
                    }
                }

                // En caso que sea un trabajo de formateo, no hace falta el tiempo fin tarea
                if (trabajo.letra === "C") {
                    fin_tarea = "-";
                }
            }

            // Caso 2 de 4: fin tarea T1
            else if (fin_tarea_t1 < fin_tarea_t2 || fin_tarea_t2 === "-") {
                evento = "Fin tarea T1";
                reloj = vectorEstado[10];
                rnd_llegada = "-";
                llegada = "-";

                // if (colaFormateos.length > 0) {
                if (cola_formateos.length > 1000) {
                    // obtenemos el próximo trabajo de formateo
                    let trabajoFormateo = cola_formateos.shift();
                    vectorEstado[2] = reloj + ult_min_trab_c;
                }
                // en caso que haya alguna PC en cola
                else if (cola > 0) {
                    // Generamos el proximo trabajo
                    [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

                    // Generamos el proximo fin de tarea
                    [rnd_fin_tarea, fin_tarea, pc] = generarProximoFinTarea(
                        distrib_trab_a,
                        distrib_trab_b,
                        trabajo,
                        reloj,
                        prim_min_trab_c
                    );
                    
                    //Sumamos el tiempo acumulado que estuvo ocupado con la pc anterior
                    acum_tiempo_ocupacion_t1 += truncateDecimals(reloj - tiempo_ocupacion_t1, 2);
                

                    // Ocupamos el tecnico 1
                    [fin_tarea_t1, estado_t1, tiempo_ocupacion_t1] =
                        ocuparTecnico(
                            reloj,
                            fin_tarea,
                            trabajo,
                            ult_min_trab_c
                        );
                    
                    
                    
                    

                    // En caso que sea un trabajo de formateo, no hace falta el tiempo fin tarea
                    if (trabajo.letra === "C") {
                        fin_tarea = "-";
                    }

                    // Restamos 1 a la cola
                    cola--;
                    
                }
                // en caso que no haya ninguna PC en cola
                else {
                    acum_tiempo_ocupacion_t1 += truncateDecimals(reloj - tiempo_ocupacion_t1, 2);

                    // No generamos ningun trabajo, ni ningun fin de tarea y el tecnico se libera
                    rnd_trabajo = "-";
                    trabajo = {
                        prob: "-",
                        tiempo: "-",
                        nombre: "-",
                        letra: "-",
                    };
                    rnd_fin_tarea = "-";
                    fin_tarea = "-";
                    fin_tarea_t1 = "-";
                    estado_t1 = "Libre";
                    tiempo_ocupacion_t1 = "-";
                }
            }

            // Caso 3 de 4: fin tarea T2
            else if (fin_tarea_t2 < fin_tarea_t1 || fin_tarea_t1 === "-") {
                evento = "Fin tarea T2";
                reloj = vectorEstado[11];
                rnd_llegada = "-";
                llegada = "-";

                // if (colaFormateos.length > 0) {
                if (cola_formateos.length > 1000) {
                    // obtenemos el próximo trabajo de formateo
                    let trabajoFormateo = cola_formateos.shift();
                    vectorEstado[2] = reloj + ult_min_trab_c;
                }
                // en caso que haya alguna PC en cola
                else if (cola > 0) {
                    // Generamos el proximo trabajo
                    [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

                    // Generamos el proximo fin de tarea
                    [rnd_fin_tarea, fin_tarea, pc] = generarProximoFinTarea(
                        distrib_trab_a,
                        distrib_trab_b,
                        trabajo,
                        reloj,
                        prim_min_trab_c
                    );

                    //Sumamos el tiempo acumulado que estuvo ocupado con la pc anterior
                    acum_tiempo_ocupacion_t2 += truncateDecimals(reloj - tiempo_ocupacion_t2, 2);

                    // Ocupamos el tecnico 2
                    [fin_tarea_t2, estado_t2, tiempo_ocupacion_t2] =
                        ocuparTecnico(
                            reloj,
                            fin_tarea,
                            trabajo,
                            ult_min_trab_c
                        );

                    // En caso que sea un trabajo de formateo, no hace falta el tiempo fin tarea
                    if (trabajo.letra === "C") {
                        fin_tarea = "-";
                    }

                    // Restamos 1 a la cola
                    cola--;

                }
                // en caso que no haya ninguna PC en cola
                else {
                    acum_tiempo_ocupacion_t2 += truncateDecimals(
                        reloj - tiempo_ocupacion_t2,
                        2
                    );

                    // No generamos ningun trabajo, ni ningun fin de tarea y el tecnico se libera
                    rnd_trabajo = "-";
                    trabajo = {
                        prob: "-",
                        tiempo: "-",
                        nombre: "-",
                        letra: "-",
                    };
                    rnd_fin_tarea = "-";
                    fin_tarea = "-";
                    fin_tarea_t2 = "-";
                    estado_t2 = "Libre";
                    tiempo_ocupacion_t2 = "-";
                }
            }

            //Caso 4 de 4

            if (vectorEstado.length > 22){
                
                for (let j = 22; j < vectorEstado.length; j += 3) {
                    //Caso 4 de 4: Fin formateo automatico (que maquina era?)
                    if ((vectorEstado[j + 2] != "-") && (vectorEstado[j + 2] < fin_tarea_t1 && vectorEstado[j+ 2] < fin_tarea_t2 && vectorEstado[j+ 2] < proxima_llegada)){
                        evento = "Fin formateo automático PC";
                        reloj = vectorEstado[j + 2];
                        rnd_llegada = "-";
                        llegada = "-";
                        rnd_trabajo = "-";
                            trabajo = {
                                prob: "-",
                                tiempo: "-",
                                nombre: "-",
                                letra: "-",
                            };
                        rnd_fin_tarea = "-";
                        fin_tarea = "-";

                        if (cola_formateos > 0){

                        }

                        if ((estado_t1 == "Libre" && estado_t2 == "Ocupado") || (estado_t1 == "Libre" && estado_t2 == "Libre")){
                            estado_t1 = "Ocupado fin formateo";
                            fin_tarea_t1 = reloj + ult_min_trab_c;
                            tiempo_ocupacion_t1 = reloj;
                        }

                        else if (estado_t1 === "Ocupado" && estado_t2 === "Libre") {
                            estado_t2 = "Ocupado fin formateo";
                            fin_tarea_t2 = reloj + ult_min_trab_c;
                            tiempo_ocupacion_t2 = reloj;
                        
                        }

                        else{
                            cola_formateos++;
                            // No generamos el proximo trabajo, ni el proximo fin de tarea
                            rnd_trabajo = "-";
                            trabajo = {
                                prob: "-",
                                tiempo: "-",
                                nombre: "-",
                                letra: "-",
                            };
                            rnd_fin_tarea = "-";
                            fin_tarea = "-";
                        
                            // en el caso que haya 3 equipos en cola, se agrega 1 equipo al acum_pcs
                            // (son las PCs que no pueden ser atendidas en este laboratorio)
                            if (cola === 3) {
                                acum_pcs++;
                            }
                        }

                        // En caso que los dos tecnicos esten ocupados, incrementamos la cola.

                    }                   


                    //recorremos el array a partir del elemento 22 para hacer los cambios de estados con la info que hay.

                    if (vectorEstado[j] == "Siendo reparada x tec1" && evento == "Fin tarea T1") {
                        acum_tiempo_permanencia += parseFloat((reloj - vectorEstado[j + 1]).toFixed(2));
                        total_pc_antendidas += 1;

                        vectorEstado[j] = "////";
                        vectorEstado[j + 1] = "////";
                        vectorEstado[j + 2] = "////";
                    }

                    else if (vectorEstado[j] == "Siendo reparada x tec2" && evento == "Fin tarea T2") {
                        acum_tiempo_permanencia += parseFloat((reloj - vectorEstado[j + 1]).toFixed(2));
                        total_pc_antendidas += 1;

                        vectorEstado[j] = "////";
                        vectorEstado[j + 1] = "////";
                        vectorEstado[j + 2] = "////";
                    }

                    else if (vectorEstado[j] == "Esperando reparacion" && evento == "Fin tarea T2") {
                        vectorEstado[j] = "Siendo reparada x tec2";
                        //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                        vectorEstado[j + 2] = "-";
                    }

                    else if (vectorEstado[j] == "Esperando reparación" && evento == "Fin tarea T1") {
                        vectorEstado[j] = "Siendo reparada x tec1";
                        //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                        vectorEstado[j + 2] = "-";
                    }

                    else if (vectorEstado[j] == "Iniciando formateo x tec1" && evento == "Fin tarea T1") {
                        vectorEstado[j] = "Formateo automático";
                        //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                        //vectorEstado[j + 2] = el que traia;
                    }

                    else if (vectorEstado[j] == "Iniciando formateo x tec2" && evento == "Fin tarea T2") {
                        vectorEstado[j] = "Formateo automático";
                        //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                        //vectorEstado[j + 2] = el que traia;
                    }



                    else if (vectorEstado[j] == "Formateo automático" && evento == "Fin formateo automático PC") {
                        if (estado_t1 == "Ocupado" && estado_t2 == "Ocupado"){
                            vectorEstado[j] = "Esperando fin reparacion";
                            //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                            vectorEstado[j + 2] = "-";
                        }
                        else if(estado_t1 == "Libre" && estado_t2 == "Ocupado"){
                            vectorEstado[j] = "Terminando formateo x tec1";
                            //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                            vectorEstado[j + 2] = "-";
                        }
                        else{
                            vectorEstado[j] = "Terminando formateo x tec2";
                            //vectorEstado[j + 1] = reloj; sigue siendo el mismo que traia
                            vectorEstado[j + 2] = "-";
                        }
        
                    }

                    else if (vectorEstado[j] == "Terminando formateo x tec1" && evento == "Fin formateo") {
                        vectorEstado[j] = "////";
                        vectorEstado[j + 1] = "////";
                        vectorEstado[j + 2] = "////";
                    }

                    else if (vectorEstado[j] == "Terminando formateo x tec2" && evento == "Fin formateo") {
                        vectorEstado[j] = "////";
                        vectorEstado[j + 1] = "////";
                        vectorEstado[j + 2] = "////";
                    }
                }
            }
        }

        vectorEstado[0] = i;
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
        vectorEstado[18] = acum_tiempo_permanencia;
        vectorEstado[19] = acum_pcs;
        vectorEstado[20] = (acum_tiempo_ocupacion_t1).toFixed(2);
        vectorEstado[21] = (acum_tiempo_ocupacion_t2).toFixed(2);

        // En caso que se haya creado una PC, la agregamos al final del vectorEstado
        if (existe_pc) {
            vectorEstado.push(pc.estado_pc);
            vectorEstado.push(pc.tiempo_llegada);
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

        if (vectorReloj[i] >= x){
            break;
        }
    }

    // agregar ultima fila en caso que 'hasta' sea menor que la cantidad de filas
    if (hasta < vectorReloj[vectorReloj.length-1]) {
        filas.push([...vectorEstado]);
    }

    //Consignas
    //Promedio de permanencia en el laboratorio de un equipo
    prom_permanencia_equipo = (acum_tiempo_permanencia / total_pc_antendidas);
    lblPromPermanenciaUnEquipo.innerHTML =
        "Promedio de permanencia en el laboratorio de un equipo: " + truncateDecimals(prom_permanencia_equipo, 2) + " minutos";
    
    //Porcentaje de equipos que no pueden ser atendidos en el laboratorio
    porc_equipos_no_atendidos = (acum_pcs / acum_llegadas_pc);
    lblPorcEquiposSinAtender.innerHTML =
        "Porcentaje de equipos que no pueden ser atendidos en el laboratorio: " + truncateDecimals(porc_equipos_no_atendidos, 2) * 100 + "%";

    //Porcentaje de ocupación de los técnicos del laboratorio
    porc_ocup_tecnico1 = (acum_tiempo_ocupacion_t1 / reloj);
    porc_ocup_tecnico2 = (acum_tiempo_ocupacion_t2 / reloj);
    lblPorcOcupTecnico.innerHTML =
        "Porcentaje de ocupación de los técnicos: " + "Tecnico1: " + truncateDecimals(porc_ocup_tecnico1, 2) * 100 + "% - " +
                                                    "Tecnico2: " + truncateDecimals(porc_ocup_tecnico2, 2) * 100 + "%"
    

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
            console.log(filas[i]);
            let fila = crearFila(filas[i], cantidad_pcs);
            tableData.push(fila);
        }

        for (let i = 0; i < cantidad_pcs; i++) {
            columnasPCs.push(
                {
                    field: `estado_pc${i + 1}`,
                    headerName: `Estado (PC${i + 1})`,
                    maxWidth: 150,
                    suppressMenu: true,
                },
                {
                    field: `tiempo_llegada${i + 1}`,
                    headerName: `Tiempo llegada (PC${i + 1})`,
                    maxWidth: 100,
                    suppressMenu: true,
                },
                {
                    field: `tiempo_fin_formateo${i + 1}`,
                    headerName: `Tiempo fin formateo (PC${i + 1})`,
                    maxWidth: 110,
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
                },
                {
                    field: "evento",
                    headerName: "Evento",
                    maxWidth: 215,
                    suppressMenu: true,
                },
                {
                    field: "reloj",
                    headerName: "Reloj (min)",
                    maxWidth: 100,
                    suppressMenu: true,
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
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "fin_tarea",
                    headerName: "Tiempo fin tarea",
                    maxWidth: 110,
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
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_permanencia",
                    headerName: "Tiempo acumulado permanencia PC",
                    maxWidth: 120,
                    suppressMenu: true,
                },
                {
                    field: "acum_pcs",
                    headerName: "Cantidad PCs sin revisión",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_ocupacion_t1",
                    headerName: "Tiempo acumulado ocupación técnico 1",
                    maxWidth: 110,
                    suppressMenu: true,
                },
                {
                    field: "acum_tiempo_ocupacion_t2",
                    headerName: "Tiempo acumulado ocupación técnico 2",
                    maxWidth: 110,
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

    // setea el tamaño de las columnas para que se adapten al ancho del header
    const allColumnIds = [];
    gridOptions.columnApi.getAllColumns().forEach((column) => {
        allColumnIds.push(column.getId());
    });
    gridOptions.columnApi.autoSizeColumns(allColumnIds);

    btnExportToExcelRandVar.removeAttribute("hidden");
};

/**
 * Funcion que se encarga de exportar la tabla a excel
 */
const exportarTablaExcel = () => {
    gridOptions.api.exportDataAsExcel();
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
        for (let i = 22; i < vectorEstado.length; i += 3) {
            numero_pc++;
            // se deben con nombres distintos sino se sobreescriben los datos
            aux[`estado_pc${numero_pc}`] = vectorEstado[i];
            aux[`tiempo_llegada${numero_pc}`] = vectorEstado[i + 1];
            aux[`tiempo_fin_formateo${numero_pc}`] = vectorEstado[i + 2];
        }

        fila = { ...fila, ...aux };
    }

    return fila;
};

// Agregar los eventos a los botones
btnSimDelete.addEventListener("click", borrarTabla);
btnSimular.addEventListener("click", simular);
btnExportToExcelRandVar.addEventListener("click", exportarTablaExcel);