class Pc {
    constructor(
        id,
        estado,
        tiempoLlegada,
        trabajo,
        tiempoTrabajo,
        tiempoFinFormateo
    ) {
        this.id = id;
        this.estado = estado;
        this.tiempoLlegada = tiempoLlegada;
        this.trabajo = trabajo;
        this.tiempoTrabajo = tiempoTrabajo;
        this.tiempoFinFormateo = tiempoFinFormateo;
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

class Tecnico {
    constructor(estado, tiempoOcupacion) {
        this.estado = estado;
        this.tiempoOcupacion = tiempoOcupacion;
    }
}

export default {
    Pc,
    Trabajo,
    Tecnico,
};
