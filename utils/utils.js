import { Trabajo } from "/models/models.js";

export function calcularProbabilidadAcumulada(probs) {
    let acu = 0;
    let probs_acum = [];
    for (let i = 0; i < probs.length; i++) {
        acu += probs[i];
        acu = +acu.toFixed(2);
        probs_acum[i] = acu;
    }
    return probs_acum;
}

export function generarTrabajos(probAcum, tiempos_trabajos) {
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
}

export function generadorUniforme(a, b, rnd) {
    let x = a + rnd * (b - a);
    return truncarDecimales(x, 2);
}

export function truncarDecimales(numero, digitos) {
    const multiplier = Math.pow(10, digitos);
    return Math.trunc(numero * multiplier) / multiplier;
}

export function transformarVectorEstadoAFila(vectorEstado) {
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
        proximo_fin_tarea: vectorEstado[10],
        estado_t1: vectorEstado[11],
        tiempo_ocupacion_t1: vectorEstado[12],
        proximo_fin_tarea_t1: vectorEstado[13],
        estado_t2: vectorEstado[14],
        tiempo_ocupacion_t2: vectorEstado[15],
        proximo_fin_tarea_t2: vectorEstado[16],
        cola: vectorEstado[17],
        cola_formateos: vectorEstado[18],
        acum_tiempo_permanencia: vectorEstado[19],
        acum_pcs: vectorEstado[20],
        acum_tiempo_ocupacion_t1: vectorEstado[21],
        acum_tiempo_ocupacion_t2: vectorEstado[22],
        total_pc_antendidas: vectorEstado[23],
    };

    if (vectorEstado.length >= 24) {
        let numero_pc = 0;
        for (let i = 24; i < vectorEstado.length; i += 3) {
            numero_pc++;
            if (vectorEstado[i] !== "") {
                aux[`estado_pc${numero_pc}`] = vectorEstado[i];
                aux[`tiempo_llegada_pc${numero_pc}`] = vectorEstado[i + 1];
                aux[`tiempo_fin_formateo_pc${numero_pc}`] = vectorEstado[i + 2];
            }
        }
        fila = { ...fila, ...aux };
    }

    return fila;
}