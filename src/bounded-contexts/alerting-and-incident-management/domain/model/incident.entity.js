export class Incident {

    constructor({id = null, title = '', message = '',
                    priority = '', studentIds = [], resolved = false,
                    resolvedAt = null, createdAt = null}) {

        this.id = id;
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.studentIds = studentIds;
        this.resolved = resolved;
        this.resolvedAt = resolvedAt;
        this.createdAt = createdAt;
    }

    markAsResolved(){
        this.resolved = true;
        this.resolvedAt = Date().toString();
    }

}