const _ = require('lodash')
const fs = require('fs')
const parseDBF = require('parsedbf');

dbf2Json = (path, encoding = 'utf-8') => {
    let dbfFile = fs.readFileSync(path)
    return parseDBF(dbfFile, encoding)
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//obtiene data de alumnos antiguos superior
parseDataFromMaestro = () => {
    let _maestro = dbf2Json('dbf/MAESTRO.DBF', 'cp850')
    _maestro = _.orderBy(_maestro, ['APA', 'AMA', 'NOM', 'SEM'], ['ASC'])

    let _alumnos = []
    _maestro.forEach((m) => {
        _alumnos.push({
            codigo: m.CDA,
            apellido_paterno: m.APA,
            apellido_materno: m.AMA,
            nombre: m.NOM,
            sexo: m.SEX,
            turno: m.TUR,
            condicion: m.CON,
            ciclo: m.SEM,
            periodo: m.MIN,
            carrera: {
                codigo: m.COC,
                nombre: m.CAR
            },
            unidad_negocio: 'SUPERIOR',
            fecha_nacimiento: m.FEN,
            dni: m.L_E,
            telefono: m.TEL,
            direccion: m.DOM,
            distrito: m.DIS
        })
    })
    return _alumnos
}

parseDataFromAlumnext = () => {
    let _maestro = dbf2Json('dbf/ALUMNEXT.DBF', 'cp850')
    _maestro = _.orderBy(_maestro, ['APA', 'AMA', 'NOM', 'SEM'], ['ASC'])

    let _alumnos = []
    _maestro.forEach((m) => {
        _alumnos.push({
            codigo: m.CDEX,
            apellido_paterno: m.APEX,
            apellido_materno: m.AMEX,
            nombre: m.NMEX,
            sexo: m.SXEX,
            turno: '',
            condicion: '',
            ciclo: '',
            periodo: '',
            carrera: {
                codigo: m.COEX,
                nombre: m.CAEX
            },
            unidad_negocio: 'FC',
            fecha_nacimiento: '',
            dni: '',
            telefono: m.NPEX,
            direccion: m.DREX,
            distrito: m.DSEX
        })
    })
    return _alumnos
}

isValidDate = (d) => {
    return d instanceof Date && !isNaN(d);
}

formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

validarString = (str) => {
    let new_str
    if (str) {
        let s = str.toString()
        if (s.includes(`'`)) {
            new_str = s.replaceAll(`'`, ``)
        } else {
            new_str = s
        }
    } else {
        new_str = ''
    }
    return new_str
}

let insertMaestro = ''
parseDataFromMaestro().forEach((a) => {
    insertMaestro += `INSERT INTO alumno_antiguo (codigo, dni, fecha_nacimiento, apellido_paterno, apellido_materno, nombre, telefono, direccion, distrito, sexo, condicion, periodo, turno, carrera_codigo, carrera_nombre, unidad_negocio) VALUES ('${validarString(a.codigo)}', '${validarString(a.dni)}', '${isValidDate(a.fecha_nacimiento) ? validarString(formatDate(a.fecha_nacimiento)) : ''}', '${validarString(a.apellido_paterno)}', '${validarString(a.apellido_materno)}', '${validarString(a.nombre)}', '${validarString(a.telefono)}', '${validarString(a.direccion)}', '${validarString(a.distrito)}', '${validarString(a.sexo)}', '${validarString(a.condicion)}', '${validarString(a.periodo)}', '${validarString(a.turno)}', '${validarString(a.carrera.codigo)}', '${validarString(a.carrera.nombre)}', '${validarString(a.unidad_negocio)}');\n`
})
parseDataFromAlumnext().forEach((a) => {
    insertMaestro += `INSERT INTO alumno_antiguo (codigo, dni, fecha_nacimiento, apellido_paterno, apellido_materno, nombre, telefono, direccion, distrito, sexo, condicion, periodo, turno, carrera_codigo, carrera_nombre, unidad_negocio) VALUES ('${validarString(a.codigo)}', '${validarString(a.dni)}', '${isValidDate(a.fecha_nacimiento) ? validarString(formatDate(a.fecha_nacimiento)) : ''}', '${validarString(a.apellido_paterno)}', '${validarString(a.apellido_materno)}', '${validarString(a.nombre)}', '${validarString(a.telefono)}', '${validarString(a.direccion)}', '${validarString(a.distrito)}', '${validarString(a.sexo)}', '${validarString(a.condicion)}', '${validarString(a.periodo)}', '${validarString(a.turno)}', '${validarString(a.carrera.codigo)}', '${validarString(a.carrera.nombre)}', '${validarString(a.unidad_negocio)}');\n`
})

fs.writeFileSync('insert_alumno_antiguo.sql', insertMaestro)