export class Delay {

    constructor({id = null, cause = '', priority = '',
                    magnitude = '', studentIds = [], createdAt = null}) {

        this.id = id;
        this.cause = cause;
        this.priority = priority;
        this.magnitude = magnitude;
        this.studentIds = studentIds;
        this.createdAt = createdAt;
    }
}