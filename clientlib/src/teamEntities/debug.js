
export class Debug {

    constructor(setupManager) {
        this.setupManager = setupManager;
    }

    emptyDb () {
        return this.setupManager.ajax.get(`/debug/empty_db`);
    }

    emptyCache () {
        return this.setupManager.ajax.get(`/debug/empty_cache`);
    }

    archive () {
        return this.setupManager.ajax.get(`/debug/archive`);
    }

    set_bruteforce(value){
        return this.setupManager.ajax.get(`/debug/set_bruteforce/${value}`);
    }

    set_app_limits(value){
        return this.setupManager.ajax.get(`/debug/set_app_limits/${value}`);
    }
}