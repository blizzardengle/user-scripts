const Fs = require('fs');
const Path = require('path');
const Sass = require('sass');

const CDN_URL = 'https://blizzardengle.github.io/user-scripts';

const CDN_REGEX = /{{CDN_URL}}/g;

class UserScripts {

    root;

    constructor(...args) {
        this.root = Path.join(__dirname, '..');
        if (args[0][2]) {
            this.run(args[0][2]);
            return;
        }
        this.run();
    }

    build() {
        const info = {};
        const scripts = Path.join(this.root, 'scripts');
        Fs.readdirSync(scripts, { withFileTypes: true }).forEach((item) => {
            if (item.isDirectory()) {
                if (item.name[0] === '.') { return; }
                this.processDir(Path.join(scripts, item.name), info);
            }
        });
        const index = Path.join(this.root, 'index.html');
        this.copyFile(index, Path.join(this.root, '__dist', 'index.html'));
    }

    copyFile(src, dest) {
        if (!Fs.existsSync(dest)) {
            Fs.mkdirSync(Path.dirname(dest), { recursive: true });
        }
        Fs.copyFileSync(src, dest);
    }

    getDestination(src) {
        const rel = src.replace(Path.join(this.root, 'scripts', Path.sep), '');
        let dest = Path.join(this.root, '__dist', rel);
        if (Path.extname(src) === '.scss') {
            dest = dest.replace(/scss/gi, 'css');
        }
        return dest;
    }

    processDir(dir, info) {
        Fs.readdirSync(dir, { withFileTypes: true }).forEach((item) => {
            const src = Path.join(dir, item.name);
            if (item.isDirectory()) {
                this.processDir(src, info);
            } else {
                const ext = Path.extname(item.name);
                if (ext === '.md') {
                    this.processMarkdown(src, info);
                    return;
                }
                const dest = this.getDestination(src);
                if (ext === '.scss') {
                    this.processScss(src, dest);
                    return;
                }
                const content = Fs.readFileSync(src);
                this.writeFile(dest, content.toString().replace(CDN_REGEX, CDN_URL));
            }
        });
    }

    processMarkdown(src, info) {

    }

    processScss(src, dest) {
        const compiled = Sass.compile(src, { style: 'compressed' });
        this.writeFile(dest, compiled.css.replace(CDN_REGEX, CDN_URL));
    }

    run(cmd) {
        switch (cmd) {
            case 'build':
                this.build();
                break;
            case 'watch':
                break;
            default:
                // eslint-disable-next-line no-console
                console.error('Build failed because no command was specified!');
                process.exit(1);
        }
    }

    writeFile(dest, content) {
        if (!Fs.existsSync(dest)) {
            Fs.mkdirSync(Path.dirname(dest), { recursive: true });
        }
        Fs.writeFileSync(dest, content);
    }

}

const US = new UserScripts(process.argv);
