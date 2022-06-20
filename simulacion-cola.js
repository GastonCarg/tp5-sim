import { Pc, Trabajo, Tecnico } from "/models/models.js";
import { generadorUniforme, truncarDecimales } from "/utils/utils.js";

const generarProximaLlegada = (reloj) => {
    let rnd = truncarDecimales(Math.random(), 2);
    let llegada = generadorUniforme(30, 90, rnd);
    let proxima_llegada = truncarDecimales(llegada + reloj, 2);
    return [rnd, llegada, proxima_llegada];
};

const generarProximoTrabajo = (trabajos) => {
    let rnd = truncarDecimales(Math.random(), 2);
    rnd === 0 && (rnd = 0.01);
    let trabajo = trabajos.find((trabajo) => trabajo.prob >= rnd);
    return [rnd, trabajo];
};

const generarProximoFinTarea = (
    reloj,
    distrib_trab_a,
    distrib_trab_b,
    trabajo,
    prim_min_trab_c
) => {
    let rnd = truncarDecimales(Math.random(), 2);
    let fin_tarea =
        generadorUniforme(distrib_trab_a, distrib_trab_b, rnd) + trabajo.tiempo;
    let proximo_fin_tarea;

    if (trabajo.obtenerAbrev() === "FD") {
        proximo_fin_tarea = reloj + prim_min_trab_c;
    } else {
        proximo_fin_tarea = truncarDecimales(fin_tarea + reloj, 2);
    }

    return [rnd, fin_tarea, proximo_fin_tarea];
};

const generarPC = (
    indice,
    nroTecnico,
    trabajo,
    reloj,
    fin_tarea,
    ult_min_trab_c
) => {
    let id = indice;
    let estado = "ER";
    let tiempoLlegada = reloj;
    let tiempoFinFormateo = "";

    if (nroTecnico === 1 || nroTecnico === 2) {
        if (trabajo.obtenerAbrev() === "FD") {
            estado = `EIF T${nroTecnico}`;
            tiempoFinFormateo = truncarDecimales(
                reloj + fin_tarea - ult_min_trab_c,
                2
            );
        } else {
            estado = `SR T${nroTecnico}`;
        }
    }

    return new Pc(id, estado, tiempoLlegada, tiempoFinFormateo);
};

const actualizarVectorEstado = (vectorEstado, pc_formateo) => {
    vectorEstado[pc_formateo.indice] = pc_formateo.obtenerEstado();
    vectorEstado[pc_formateo.indice + 1] = pc_formateo.obtenerTiempoLlegada();
    vectorEstado[pc_formateo.indice + 2] =
        pc_formateo.obtenerTiempoFinFormateo();
};

export function generacionColas(
    n,
    x,
    desde,
    hasta,
    distrib_trab_a,
    distrib_trab_b,
    prim_min_trab_c,
    ult_min_trab_c,
    trabajos
) {
    let vectorEstado = [];

    // Variables asociadas a cada elemento del vector estado
    let evento = "";
    let reloj = 0;
    let rnd_llegada = "";
    let llegada = "";
    let proxima_llegada = "";
    let rnd_trabajo = "";
    let trabajo = new Trabajo();
    let rnd_fin_tarea = "";
    let fin_tarea = "";
    let proximo_fin_tarea = "";
    let tecnico1 = new Tecnico("Libre", null);
    let tecnico2 = new Tecnico("Libre", null);
    let cola = 0;
    let cola_formateos = 0;
    let acum_tiempo_permanencia = 0;
    let acum_pcs_sin_atender = 0;
    let acum_tiempo_ocupacion_t1 = 0;
    let acum_tiempo_ocupacion_t2 = 0;
    let pc = new Pc();

    // Variables para la parte de estadisticas
    let acum_llegadas_pc = 0;
    let total_pc_antendidas = 0;
    let prom_permanencia_equipo = 0;
    let porc_equipos_no_atendidos = 0;
    let porc_ocup_t1 = 0;
    let porc_ocup_t2 = 0;

    // Varriables auxiliares
    let pcs = [];
    let id_pc = 1;

    let cantidad_pcs = 0;
    let filas = [];

    // recorrer por la cantidad de filas a simular (n)
    for (let i = 0; i < n; i++) {
        // esta bandera sirve para determinar si hay que agregar columnas al final de la tabla
        let existe_pc = false;

        // Evento 1: Inicio de la simulacion, generamos la proxima llegada
        if (i === 0) {
            evento = "Inicio";

            [rnd_llegada, llegada, proxima_llegada] = generarProximaLlegada(0);
        }

        // Evento 2: llegada de la primer PC
        else if (i === 1) {
            acum_llegadas_pc++;
            evento = "Llegada PC" + acum_llegadas_pc;
            reloj = vectorEstado[5];

            // Generamos la proxima llegada de PC
            [rnd_llegada, llegada, proxima_llegada] =
                generarProximaLlegada(reloj);

            // Generamos el proximo trabajo
            [rnd_trabajo, trabajo] = generarProximoTrabajo(trabajos);

            // Generamos el proximo fin de tarea
            [rnd_fin_tarea, fin_tarea, proximo_fin_tarea] =
                generarProximoFinTarea(
                    reloj,
                    distrib_trab_a,
                    distrib_trab_b,
                    trabajo,
                    prim_min_trab_c
                );

            // Determinar cual tecnico toma el trabajo
            if (Math.random() < 0.5) {
                pc = generarPC(
                    id_pc,
                    1,
                    trabajo,
                    reloj,
                    fin_tarea,
                    ult_min_trab_c
                );

                tecnico1.ocupar(reloj, proximo_fin_tarea);
            } else {
                pc = generarPC(
                    id_pc,
                    2,
                    trabajo,
                    reloj,
                    fin_tarea,
                    ult_min_trab_c
                );

                tecnico2.ocupar(reloj, proximo_fin_tarea);
            }

            pcs.push(pc);
            existe_pc = true;
        }

        // Evento 3 en adelante: resto de la simulacion
        else {
            let miPc = pcs.find(
                (pc) => typeof pc.tiempoFinFormateo === "number"
            );
            let pc_formateo;

            if (typeof miPc !== "undefined") {
                let menor = miPc.tiempoFinFormateo;
                pcs.forEach((pc, i) => {
                    if (typeof pc.tiempoFinFormateo === "number") {
                        if (pc.tiempoFinFormateo <= menor) {
                            menor = pc.tiempoFinFormateo;
                            pc_formateo = pcs[i];
                        }
                    }
                });
            }

            let tiempos = [];
            if (typeof proxima_llegada === "number") {
                tiempos.push([proxima_llegada, 0]);
            }
            if (typeof tecnico1.obtenerProximoFinTarea() === "number") {
                tiempos.push([tecnico1.obtenerProximoFinTarea(), 1]);
            }
            if (typeof tecnico2.obtenerProximoFinTarea() === "number") {
                tiempos.push([tecnico2.obtenerProximoFinTarea(), 2]);
            }
            if (typeof pc_formateo !== "undefined") {
                tiempos.push([pc_formateo.tiempoFinFormateo, 3]);
            }

            let menor = tiempos[0][0];
            let idx = 0;
            for (let i = 0; i < tiempos.length; i++) {
                if (tiempos[i][0] < menor) {
                    menor = tiempos[i][0];
                    idx = tiempos[i][1];
                }
            }

            // Evento
            if (idx === 0) {
                evento = "Llegada PC";
            }
            if (idx === 1) {
                evento = "Fin tarea T1";
            }
            if (idx === 2) {
                evento = "Fin tarea T2";
            }
            if (idx === 3) {
                evento = "Fin formateo automático";
            }

            switch (evento) {
                case "Llegada PC":
                    acum_llegadas_pc++;
                    evento = "Llegada PC" + acum_llegadas_pc;
                    reloj = vectorEstado[5];

                    // Generamos la proxima llegada de PC
                    [rnd_llegada, llegada, proxima_llegada] =
                        generarProximaLlegada(reloj);

                    // Caso 2.1: ambos tecnicos ocupados
                    if (tecnico1.estaOcupado() && tecnico2.estaOcupado()) {
                        // en el caso que haya 3 equipos en cola, se agrega 1 equipo al acum_pcs
                        // (son las PCs que no pueden ser atendidas en este laboratorio)
                        if (cola === 3) {
                            existe_pc = false;
                            acum_pcs_sin_atender++;
                        } else {
                            // Generamos PC 'ER'
                            pc = generarPC(
                                id_pc,
                                0,
                                trabajo,
                                reloj,
                                fin_tarea,
                                ult_min_trab_c
                            );

                            pcs.push(pc);

                            existe_pc = true;
                            cola++;
                        }

                        // No generamos el proximo trabajo ni el proximo fin de tarea
                        rnd_trabajo = "";
                        trabajo = new Trabajo("", "", "", "");
                        rnd_fin_tarea = "";
                        fin_tarea = "";
                    }

                    // Caso 2.2: alguno de los tecnicos libre
                    else {
                        // Generamos el proximo trabajo
                        [rnd_trabajo, trabajo] =
                            generarProximoTrabajo(trabajos);

                        // Generamos el proximo fin de tarea
                        [rnd_fin_tarea, fin_tarea, proximo_fin_tarea] =
                            generarProximoFinTarea(
                                reloj,
                                distrib_trab_a,
                                distrib_trab_b,
                                trabajo,
                                prim_min_trab_c
                            );

                        // Determinar cual tecnico toma el trabajo
                        if (!tecnico1.estaOcupado()) {
                            pc = generarPC(
                                id_pc,
                                1,
                                trabajo,
                                reloj,
                                fin_tarea,
                                ult_min_trab_c
                            );

                            tecnico1.ocupar(reloj, proximo_fin_tarea);
                        } else {
                            pc = generarPC(
                                id_pc,
                                2,
                                trabajo,
                                reloj,
                                fin_tarea,
                                ult_min_trab_c
                            );

                            tecnico2.ocupar(reloj, proximo_fin_tarea);
                        }

                        pcs.push(pc);

                        existe_pc = true;

                        if (trabajo.obtenerAbrev() === "FD") {
                            cola_formateos > 0 && cola_formateos--;
                        } else {
                            cola > 0 && cola--;
                        }
                    }
                    break;

                case "Fin tarea T1":
                    evento = "Fin tarea T1";
                    reloj = tecnico1.obtenerProximoFinTarea();
                    acum_tiempo_ocupacion_t1 += truncarDecimales(
                        reloj - tecnico1.obtenerTiempoOcupacion(),
                        2
                    );

                    for (let i = 0; i < pcs.length; i++) {
                        if (
                            pcs[i].estado === "SR T1" ||
                            pcs[i].estado === "EFF T1"
                        ) {
                            // Sumamos 1 pc atendida
                            total_pc_antendidas++;

                            // Actualizamos el tiempo de permanencia
                            acum_tiempo_permanencia += truncarDecimales(
                                reloj - pcs[i].tiempoLlegada,
                                2
                            );

                            // Destruimos la pc
                            pcs[i].destruir();
                            actualizarVectorEstado(vectorEstado, pcs[i]);

                            // Eliminamos la PC del vector
                            pcs.splice(i, 1);

                            break;
                        } else if (pcs[i].estado === "EIF T1") {
                            pcs[i].enFormateoAutomatico();
                            actualizarVectorEstado(vectorEstado, pcs[i]);
                            break;
                        }
                    }

                    // Caso 3.1: existe alguna PC en cola de formateo (PCs listas para la etapa final de formateo)
                    if (cola_formateos > 0) {
                        let pcsEEFF = [];
                        pcs.map((pc) => {
                            if (pc.estado === "EEFF") {
                                pcsEEFF.push(pc);
                            }
                        });

                        let men = pcsEEFF[0].tiempoLlegada;
                        let pc_a_actualizar;

                        for (let i = 0; i < pcsEEFF.length; i++) {
                            if (pcsEEFF[i].tiempoLlegada <= men) {
                                men = pcsEEFF[i].tiempoLlegada;
                                pc_a_actualizar = pcsEEFF[i];
                            }
                        }

                        // actualizar estado PC a EFF T1
                        pc_a_actualizar.enEtapaFinFormateo(1);
                        actualizarVectorEstado(vectorEstado, pc_a_actualizar);

                        // ocupamos al tecnico
                        tecnico1.ocupar(reloj, ult_min_trab_c + reloj);

                        cola_formateos--;
                    }

                    // Caso 3.2: existe alguna PC en cola
                    else if (cola > 0) {
                        let pc_a_actualizar = pcs.find(
                            (pc) => pc.estado === "ER"
                        );

                        // Generamos el proximo trabajo
                        [rnd_trabajo, trabajo] =
                            generarProximoTrabajo(trabajos);

                        // Generamos el proximo fin de tarea
                        [rnd_fin_tarea, fin_tarea, proximo_fin_tarea] =
                            generarProximoFinTarea(
                                reloj,
                                distrib_trab_a,
                                distrib_trab_b,
                                trabajo,
                                prim_min_trab_c
                            );

                        // actualizar estado PC a SR o EIF segun corresponda
                        if (trabajo.obtenerAbrev() === "FD") {
                            pc_a_actualizar.enEtapaInicioFormateo(1);
                        } else {
                            pc_a_actualizar.enReparacion(1);
                        }
                        actualizarVectorEstado(vectorEstado, pc_a_actualizar);

                        // ocupamos al tecnico
                        tecnico1.ocupar(reloj, proximo_fin_tarea);

                        cola--;
                    }

                    // Caso 3.3: no hay ninguna PC en cola
                    else {
                        // Liberamos al tecnico y actualizamos el reloj
                        reloj = vectorEstado[12];
                        tecnico1.liberar();

                        // No generamos trabajo, ni fin de tarea
                        rnd_trabajo = "";
                        trabajo = new Trabajo("", "", "", "");
                        rnd_fin_tarea = "";
                        fin_tarea = "";
                    }

                    rnd_llegada = "";
                    llegada = "";
                    break;

                case "Fin tarea T2":
                    evento = "Fin tarea T2";
                    reloj = tecnico2.obtenerProximoFinTarea();
                    acum_tiempo_ocupacion_t2 += truncarDecimales(
                        reloj - tecnico2.obtenerTiempoOcupacion(),
                        2
                    );

                    for (let i = 0; i < pcs.length; i++) {
                        if (
                            pcs[i].estado === "SR T2" ||
                            pcs[i].estado === "EFF T2"
                        ) {
                            // Sumamos 1 pc atendida
                            total_pc_antendidas++;

                            // Actualizamos el tiempo de permanencia
                            acum_tiempo_permanencia += truncarDecimales(
                                reloj - pcs[i].tiempoLlegada,
                                2
                            );

                            // Destruimos la pc
                            pcs[i].destruir();
                            actualizarVectorEstado(vectorEstado, pcs[i]);

                            // Eliminamos la PC del vector
                            pcs.splice(i, 1);

                            break;
                        } else if (pcs[i].estado === "EIF T2") {
                            pcs[i].enFormateoAutomatico();
                            actualizarVectorEstado(vectorEstado, pcs[i]);
                            break;
                        }
                    }

                    // Caso 3.1: existe alguna PC en cola de formateo (PCs listas para la etapa final de formateo)
                    if (cola_formateos > 0) {
                        let pcsEEFF = [];
                        pcs.map((pc) => {
                            if (pc.estado === "EEFF") {
                                pcsEEFF.push(pc);
                            }
                        });

                        let men = pcsEEFF[0].tiempoLlegada;
                        let pc_a_actualizar;

                        for (let i = 0; i < pcsEEFF.length; i++) {
                            if (pcsEEFF[i].tiempoLlegada <= men) {
                                men = pcsEEFF[i].tiempoLlegada;
                                pc_a_actualizar = pcsEEFF[i];
                            }
                        }

                        // actualizar estado PC a EFF T2
                        pc_a_actualizar.enEtapaFinFormateo(2);
                        actualizarVectorEstado(vectorEstado, pc_a_actualizar);

                        // ocupamos al tecnico
                        tecnico2.ocupar(reloj, ult_min_trab_c + reloj);

                        cola_formateos--;
                    }

                    // Caso 3.2: existe alguna PC en cola
                    else if (cola > 0) {
                        let pc_a_actualizar = pcs.find(
                            (pc) => pc.estado === "ER"
                        );

                        // Generamos el proximo trabajo
                        [rnd_trabajo, trabajo] =
                            generarProximoTrabajo(trabajos);

                        // Generamos el proximo fin de tarea
                        [rnd_fin_tarea, fin_tarea, proximo_fin_tarea] =
                            generarProximoFinTarea(
                                reloj,
                                distrib_trab_a,
                                distrib_trab_b,
                                trabajo,
                                prim_min_trab_c
                            );

                        // actualizar estado PC a SR o EIF segun corresponda
                        if (trabajo.obtenerAbrev() === "FD") {
                            pc_a_actualizar.enEtapaInicioFormateo(2);
                        } else {
                            pc_a_actualizar.enReparacion(2);
                        }
                        actualizarVectorEstado(vectorEstado, pc_a_actualizar);

                        // liberamos al tecnico
                        tecnico2.ocupar(reloj, proximo_fin_tarea);

                        cola--;
                    }

                    // Caso 3.3: no hay ninguna PC en cola
                    else {
                        // Liberamos al tecnico y actualizamos el reloj
                        reloj = vectorEstado[15];
                        tecnico2.liberar();

                        // No generamos trabajo, ni fin de tarea
                        rnd_trabajo = "";
                        trabajo = new Trabajo("", "", "", "");
                        rnd_fin_tarea = "";
                        fin_tarea = "";
                    }

                    rnd_llegada = "";
                    llegada = "";
                    break;

                case "Fin formateo automático":
                    evento = "Fin formateo automático";
                    reloj = pc_formateo.tiempoFinFormateo;

                    if (tecnico1.estaOcupado() && tecnico2.estaOcupado()) {
                        // actualizar estado PC a EEFF
                        pc_formateo.enEsperaEtapaFinFormateo();
                        actualizarVectorEstado(vectorEstado, pc_formateo);

                        cola_formateos++;
                    } else {
                        if (!tecnico1.estaOcupado()) {
                            // actualizar estado PC a EFF T1
                            pc_formateo.enEtapaFinFormateo(1);
                            actualizarVectorEstado(vectorEstado, pc_formateo);

                            tecnico1.ocupar(reloj, ult_min_trab_c + reloj);
                        } else {
                            // actualizar estado PC a EFF T2
                            pc_formateo.enEtapaFinFormateo(2);
                            actualizarVectorEstado(vectorEstado, pc_formateo);

                            tecnico2.ocupar(reloj, ult_min_trab_c + reloj);
                        }

                        cola_formateos > 0 && cola_formateos--;
                    }

                    // No generamos llegada, ni trabajo, ni fin de tarea
                    rnd_llegada = "";
                    llegada = "";
                    rnd_trabajo = "";
                    trabajo = new Trabajo("", "", "", "");
                    rnd_fin_tarea = "";
                    fin_tarea = "";
                    break;
            }
        }

        // Actualizacion del vectorEstado
        vectorEstado[0] = i + 1;
        vectorEstado[1] = evento;
        vectorEstado[2] = typeof reloj === "number" ? reloj.toFixed(2) : reloj;
        vectorEstado[3] = rnd_llegada;
        vectorEstado[4] = llegada;
        vectorEstado[5] = proxima_llegada;
        vectorEstado[6] = rnd_trabajo;
        vectorEstado[7] = trabajo.nombre;
        vectorEstado[8] = rnd_fin_tarea;
        vectorEstado[9] = fin_tarea;
        vectorEstado[10] = tecnico1.estado;
        vectorEstado[11] =
            typeof tecnico1.tiempoOcupacion === "number"
                ? tecnico1.tiempoOcupacion.toFixed(2)
                : tecnico1.tiempoOcupacion;
        vectorEstado[12] =
            typeof tecnico1.proximoFinTarea === "number"
                ? tecnico1.proximoFinTarea.toFixed(2)
                : tecnico1.proximoFinTarea;
        vectorEstado[13] = tecnico2.estado;
        vectorEstado[14] =
            typeof tecnico2.tiempoOcupacion === "number"
                ? tecnico2.tiempoOcupacion.toFixed(2)
                : tecnico2.tiempoOcupacion;
        vectorEstado[15] =
            typeof tecnico2.proximoFinTarea === "number"
                ? tecnico2.proximoFinTarea.toFixed(2)
                : tecnico2.proximoFinTarea;
        vectorEstado[16] = cola;
        vectorEstado[17] = cola_formateos;
        vectorEstado[18] = acum_tiempo_permanencia.toFixed(2);
        vectorEstado[19] = acum_pcs_sin_atender;
        vectorEstado[20] = acum_tiempo_ocupacion_t1.toFixed(2);
        vectorEstado[21] = acum_tiempo_ocupacion_t2.toFixed(2);
        vectorEstado[22] = total_pc_antendidas;

        // En caso que se haya creado una PC, la agregamos al final del vectorEstado
        if (existe_pc) {
            vectorEstado.push(pc.estado);
            vectorEstado.push(pc.tiempoLlegada);
            vectorEstado.push(pc.tiempoFinFormateo);
            existe_pc = false;
            cantidad_pcs++;
            id_pc++;
        }

        // agregar filas desdeHasta
        if (reloj >= desde && reloj <= hasta) {
            filas.push([...vectorEstado]);
        }

        //Comparar si el reloj en cada iteracion es mayor que el x ingresado, en ese caso corta la simulacion.
        if (reloj >= x) {
            break;
        }
    }

    // agregar ultima fila en caso que 'hasta' sea menor que la cantidad de filas
    if (hasta < reloj) {
        filas.push([...vectorEstado]);
    }

    //Consignas
    let consignas = [];
    //Promedio de permanencia en el laboratorio de un equipo
    prom_permanencia_equipo = acum_tiempo_permanencia / total_pc_antendidas;
    consignas.push(prom_permanencia_equipo);

    //Porcentaje de equipos que no pueden ser atendidos en el laboratorio
    porc_equipos_no_atendidos = acum_pcs_sin_atender / acum_llegadas_pc;
    consignas.push(porc_equipos_no_atendidos);

    //Cantidad llegadas
    consignas.push(acum_llegadas_pc);

    //Porcentaje de ocupación de los técnicos del laboratorio
    porc_ocup_t1 = acum_tiempo_ocupacion_t1 / reloj;
    consignas.push(porc_ocup_t1);
    porc_ocup_t2 = acum_tiempo_ocupacion_t2 / reloj;
    consignas.push(porc_ocup_t2);

    return [filas, cantidad_pcs, consignas];
}
