export class Pc {
    constructor(id, estado, tiempoLlegada, tiempoFinFormateo) {
        this.id = id;
        this.indice = 22 + this.id * 3 - 2;
        this.estado = estado;
        this.tiempoLlegada = tiempoLlegada;
        this.tiempoFinFormateo = tiempoFinFormateo;
    }

    destruir() {
        this.estado = "";
        this.tiempoLlegada = "";
        this.tiempoFinFormateo = "";
    }

    enEtapaFinFormateo(nroTecnico) {
        nroTecnico === 1 ? (this.estado = "EFF T1") : (this.estado = "EFF T2");
        this.tiempoFinFormateo = "";
    }

    enEtapaInicioFormateo(nroTecnico, tiempoFinFormateo) {
        nroTecnico === 1 ? (this.estado = "EIF T1") : (this.estado = "EIF T2");
        this.tiempoFinFormateo = tiempoFinFormateo;
    }

    enReparacion(nroTecnico) {
        nroTecnico === 1 ? (this.estado = "SR T1") : (this.estado = "SR T2");
    }

    enEsperaEtapaFinFormateo() {
        this.estado = "EEFF";
        this.tiempoFinFormateo = "";
    }

    enFormateoAutomatico() {
        this.estado = "FA";
    }

    obtenerEstado() {
        return this.estado;
    }

    obtenerTiempoLlegada() {
        return this.tiempoLlegada;
    }

    obtenerTiempoFinFormateo() {
        return this.tiempoFinFormateo;
    }
}

export class Trabajo {
    constructor(prob, tiempo, nombre, abrev) {
        this.prob = prob;
        this.tiempo = tiempo;
        this.nombre = nombre;
        this.abrev = abrev;
    }

    obtenerAbrev() {
        return this.abrev;
    }
}

export class Tecnico {
    constructor(estado, tiempoOcupacion, proximoFinTarea) {
        this.estado = estado;
        this.tiempoOcupacion = tiempoOcupacion;
        this.proximoFinTarea = proximoFinTarea;
    }

    estaOcupado() {
        if (this.estado === "Ocupado") {
            return true;
        }
        return false;
    }

    ocupar(reloj, proximoFinTarea) {
        this.estado = "Ocupado";
        this.tiempoOcupacion = reloj;
        this.proximoFinTarea = proximoFinTarea;
    }

    liberar() {
        this.estado = "Libre";
        this.tiempoOcupacion = "";
        this.proximoFinTarea = "";
    }

    obtenerProximoFinTarea() {
        return this.proximoFinTarea;
    }

    obtenerTiempoOcupacion() {
        return this.tiempoOcupacion;
    }
}
