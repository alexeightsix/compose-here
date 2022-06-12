class Validate {
    static isValid(value, rule) {
        let regex;

        switch (rule) {
            case 'namespace':
                regex = /^[a-z]{2,8}/;
                return regex.exec(value) !== null;
            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch (e) {
                    return false;
                }
        }
    }
}

module.exports = Validate;