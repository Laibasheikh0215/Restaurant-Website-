class CacheService {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expiry) {
            return item.data;
        }
        return null;
    }

    set(key, data, ttl = 5 * 60 * 1000) { // 5 minutes default
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + ttl
        });
    }

    clear(key) {
        this.cache.delete(key);
    }
}

export default new CacheService();