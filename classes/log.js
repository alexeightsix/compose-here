const chalk = require('chalk');

class Log {
    static success(text) {
        return console.log(chalk.green(text));

    }
    static error(text) {
        console.log(chalk.redBright(text));
        process.exit(1);
    }
}

module.exports = Log;