const fs = require('fs');
const log = require('./log.js');
const URL = require("url").URL;
const Validate = require("./validate.js");
const isPortAvailable = require('is-port-available');
const { execSync } = require('child_process');
const { merge, get } = require('lodash');
const prompts = require('prompts');
const childProcess = require('child_process');

class App {
    constructor(config) {
        const defaultConfig = {
            containers: null,
            url: null,
            namespace: null,
            root: require.main.path,
            dest: null,
            install_laravel: false
        };

        defaultConfig.containers = this.getContainers(defaultConfig.root);

        this.config = merge(defaultConfig, config);

        // this.config.namespace = "xps";
        // this.config.dest = process.cwd();
        // this.config.url = new URL("http://dev.local");
        // this.config.containers.adminer.host_port = 6600;
        // this.config.containers.mailcatcher.host_port = 6601;
        // this.config.containers.mailcatcher.host_port = 6602;
        // this.config.containers.nginx.host_port = 6680;
        // this.config.laravel = true;

        // console.log(this.config);
    }

    run = async () => {
        this.checkDependencies();
        await this.askNamespace();
        await this.askDest();
        await this.askUrl();
        await this.askPorts();
        this.createDirs();
        this.populateDockerCompose();
        this.populateConfigs("config");
        this.populateConfigs("build");
        await this.buildContainers();
        await this.askLaravel();
        this.finished();
    }

    getProperty = (propertyName) => {
        propertyName = propertyName.replace("config.", "");
        return get(this.config, propertyName);
    }

    hasProperty = (propertyName) => (this.getProperty(propertyName) !== null);

    checkDependencies = () => {
        try {
            execSync("git --version 2>/dev/null");
        } catch (e) {
            log.error("git is not installed");
        }

        try {
            execSync("docker info 2>/dev/null");
            execSync("docker-compose version 2>/dev/null");
        } catch (e) {
            log.error("docker is not running");
        }
    }

    askNamespace = async () => {
        if (this.config.namespace)
            return this;

        const response = await prompts({
            type: 'text',
            name: 'namespace',
            message: 'Project Namespace?',
            validate: (answer) => Validate.isValid(answer, "namespace")
        });

        this.config.namespace = response.namespace;

        return this;
    }

    askDest = async () => {
        if (this.config.dest)
            return this;

        const response = await prompts({
            type: 'confirm',
            name: 'destination',
            message: `Project root? ${process.cwd()}`
        });

        if (!response.destination)
            log.error("Project root must be defined.");

        this.config.dest = process.cwd();

        return this;
    }

    askUrl = async () => {
        if (this.config.url)
            return this;

        const response = await prompts({
            type: 'text',
            name: 'url',
            message: `App URL?`,
            validate: (answer) => Validate.isValid(answer, "url")
        });

        this.config.url = new URL(response.url);

        if (this.config.url.port)
            this.config.containers.nginx.host_port = Number(this.config.url.port);

        return this;
    }

    getContainers = (root) => {
        let out = [];

        fs.readdirSync(`${root}/containers/`, { withFileTypes: true }).forEach((container) => {
            if (container.isDirectory()) {
                out[container.name] = {
                    "service_name": container.name,
                    "host_port": null
                };
            }
        });

        return out;
    }

    askPorts = async () => {
        let used = [];

        if (this.config.containers.nginx.host_port !== null)
            used.push(this.config.containers.nginx.host_port);

        let containers = Object.keys(this.config.containers).filter((container) => {
            container = this.config.containers[container];
            let sn = container.service_name;
            const alreadyDefined = container.host_port !== null;
            const inDockerCompose = fs.readFileSync(`${this.config.root}/containers/${sn}/${sn}.yml`).includes(`\${config.containers.${sn}.host_port}:`);
            return !alreadyDefined && inDockerCompose && container.host_port == null && !used.includes(container.host_port);
        });

        while (containers.length) {
            let container = containers[0];

            const response = await prompts({
                type: 'number',
                name: 'port',
                message: `What port do you want to assign ${container}:`,
            });

            await isPortAvailable(response.port).then((port) => {
                if (!port)
                    return;

                if (used.includes(response.port))
                    return;

                this.config.containers[container].host_port = response.port;

                used.push(response.port);
                containers.shift();
            });

        }
    }

    createDirs = () => {
        if (!fs.existsSync(this.config.dest + '/.docker'))
            fs.mkdirSync(this.config.dest + '/.docker', { recursive: true });
        return this;
    }

    replaceVars = (template_str) => {
        for (const match of template_str.matchAll(/\${config.(?<path>[a-z._]+)}/gm)) {
            let path = match.groups.path;
            if (this.hasProperty(path))
                template_str = template_str.replace(match[0], this.getProperty(path));
        }

        return template_str;
    }

    indentLines = (template_str, spacing) => template_str.replace(/^/gm, spacing)

    populateDockerCompose = () => {
        let containers = Object.entries(this.config.containers);

        let containers_str = "";
        let i = 0;

        containers.forEach((container) => {
            container = container[0]

            let contents = fs.readFileSync(this.config.root + '/containers/' + container + "/" + container + ".yml", 'utf8');
            contents = this.replaceVars(contents);
            contents = this.indentLines(contents, "    "), "";

            if (i != containers.length)
                contents = contents + "\n";

            containers_str += contents;

            i++;
        });

        let template = fs.readFileSync(this.config.root + "/containers/docker-compose.yml", "utf8");

        template = template.replace("{{containers}}", containers_str);

        const p = this.config.dest + "/docker-compose.yml";

        fs.writeFileSync(p, template);

        try {
            execSync("docker-compose -f" + this.config.dest + "/docker-compose.yml config");
        } catch (e) {
            log.error("Invalid Docker-Compose File");
        }
    }

    populateConfigs = (folder) => {
        Object.keys(this.config.containers).forEach((container) => {
            const p = this.config.root + "/containers/" + container + "/" + folder;

            if (fs.existsSync(p)) {

                const files = fs.readdirSync(p, { withFileTypes: true }).filter((file) => {
                    return file.isFile;
                }).forEach((file) => {
                    let contents = fs.readFileSync(p + "/" + file.name, "utf8");

                    contents = this.replaceVars(contents).trim();

                    let z = this.config.dest + "/.docker/" + container + "/" + folder;

                    if (!fs.existsSync(z))
                        fs.mkdirSync(z, { recursive: true })

                    const fileName = this.replaceVars(file.name);

                    fs.writeFileSync(z + "/" + fileName, contents);
                    log.success(`✔ Created ${z}/${fileName}`);
                });
            }
        })
    }

    execCommand = async (cmd, args) => {
        return new Promise(async (resolve, reject) => {
            const process = childProcess.spawn(cmd, args);
            process.stdout.on('data', (data) => console.log(`${data}`))
            process.stderr.on('data', (data) => console.log(`${data}`))
            process.on("close", (code) => (code == 0) ? resolve(code) : log.error(code));
        });
    };


    askLaravel = async () => {
        let response = null;

        if (!this.config.install_laravel) {
            response = await prompts({
                type: 'confirm',
                name: 'install_laravel',
                message: `Install Laravel?`
            });
        }

        if (this.config.install_laravel || response.install_laravel) {

            const environment = [
                '-e',
                `NAMESPACE=${this.config.namespace}`,
                '-e',
                `DB_HOST=${this.config.namespace}-mysql`,
                '-e',
                `DB_PORT=3306`,
                '-e',
                `DB_DATABASE=${this.config.namespace}`,
                '-e',
                `DB_USERNAME=root`,
                '-e',
                `DB_PASSWORD=${this.config.namespace}`,
                '-e',
                `DB_DATABASE=${this.config.namespace}`,
                '-e',
                `APP_URL="undefined"`
            ];

            await this.execCommand("docker", ['cp', `${this.config.root}/installers/laravel.sh`, `${this.config.namespace}-php:/root`]);
            await this.execCommand("docker", ['exec', `${this.config.namespace}-php`, 'chmod', 'a+x', `/root/laravel.sh`]);
            await this.execCommand("docker", ['exec', environment, '-i', `${this.config.namespace}-php`, '/root/laravel.sh'].flat());
        }
        return this;
    }

    async buildContainers() {
        await this.execCommand("docker-compose", ['-f', `${this.config.dest}/docker-compose.yml`, 'up', '-d', '--build']);
        return this;
    }

    finished = () => {
        this.config.url.port = this.config.containers.nginx.host_port;
        console.log(`Add the following entry to your /etc/hosts file: \n 127.0.0.1 ${this.config.url.hostname}`);
        const endpoint = `${this.config.url.href}`;
        console.log(`App URL: ${endpoint}`);
        return this;
    }
}

module.exports = App;