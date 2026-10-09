
import { Person } from './person.js';

/**
 * Representa los posibles estados de un estudiante
 * dentro del Bounded Context de Profiles & Relationship Management.
 *
 * @readonly
 * @enum {string}
 */
export const StudentStatus = Object.freeze({
    /** Indica que el estudiante está activo. */
    ACTIVE: 'ACTIVE',

    /** Indica que el estudiante está inactivo. */
    INACTIVE: 'INACTIVE',
});

/**
 * Verifica si un estado pertenece a StudentStatus.
 *
 * @param {string} value - Estado que se desea validar.
 * @returns {boolean} Verdadero si el estado es válido.
 */
export const isValidStudentStatus = (value) => {
    return Object.values(StudentStatus).includes(value);
};

/**
 * Entidad que representa a un estudiante dentro del
 * Bounded Context de Profiles & Relationship Management.
 *
 * Hereda la información personal de Person y contiene
 * los datos específicos de un estudiante.
 *
 * @class Student
 * @extends Person
 */
export class Student extends Person {
    /**
     * Inicializa una nueva instancia de Student.
     *
     * @param {Object} params - Atributos de la entidad.
     * @param {?string} [params.id=null] - Identificador del estudiante.
     * @param {string} [params.firstName=''] - Nombre del estudiante.
     * @param {string} [params.lastName=''] - Apellido del estudiante.
     * @param {string} [params.birthDate=''] - Fecha de nacimiento en formato YYYY-MM-DD.
     * @param {string} [params.schoolName=''] - Nombre del colegio.
     * @param {string} [params.status=StudentStatus.ACTIVE] - Estado del estudiante.
     */
    constructor({
                    id = null,
                    firstName = '',
                    lastName = '',
                    birthDate = '',
                    schoolName = '',
                    status = StudentStatus.ACTIVE,
                } = {}) {
        super({id, firstName, lastName});

        this.birthDate = birthDate;
        this.schoolName = schoolName;
        this.status = status;
    }

    /**
     * Obtiene la fecha de nacimiento del estudiante.
     *
     * @returns {string} Fecha de nacimiento en formato YYYY-MM-DD.
     */
    get birthDate() {
        return this._birthDate;
    }

    /**
     * Actualiza la fecha de nacimiento del estudiante.
     *
     * @param {string} value - Nueva fecha de nacimiento.
     */
    set birthDate(value) {
        this._birthDate = value.trim();
    }

    /**
     * Obtiene el nombre del colegio del estudiante.
     *
     * @returns {string} Nombre del colegio.
     */
    get schoolName() {
        return this._schoolName;
    }

    /**
     * Actualiza el nombre del colegio del estudiante.
     *
     * @param {string} value - Nuevo nombre del colegio.
     */
    set schoolName(value) {
        this._schoolName = value.trim();
    }

    /**
     * Obtiene el estado actual del estudiante.
     *
     * @returns {string} Estado del estudiante.
     */
    get status() {
        return this._status;
    }

    /**
     * Actualiza el estado del estudiante.
     *
     * @param {string} value - Nuevo estado del estudiante.
     * @throws {Error} Si el estado no pertenece a StudentStatus.
     */
    set status(value) {
        if (!isValidStudentStatus(value)) {
            throw new Error(`Invalid student status: ${value}`);
        }

        this._status = value;
    }
}

