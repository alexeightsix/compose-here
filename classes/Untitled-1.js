const namespace = "aow";

const environment = [
    '-e',
    `NAMESPACE=${namespace}`,
    '-e',
    `DB_HOST=${namespace}-mysql`,
    '-e',
    `DB_PORT=3306`,
    '-e',
    `DB_DATABASE=${namespace}`,
    '-e',
    `DB_USERNAME=root`,
    '-e',
    `DB_PASSWORD=${namespace}`,
    '-e',
    `DB_DATABASE=${namespace}`,
    '-e',
    `APP_URL=test`
];