require('dotenv').config()

const fs = require("fs");

function getLibsJson() {
    return process.env.libsjson || 'libs-common-cdn.json';
}

function getLibs() {
    const libsjson = getLibsJson();
    const file = `${__dirname}/src/${libsjson}`;

    if (!fs.existsSync(file))
        return null;

    try {
        const content = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(content);

        return json;
    } catch (x) {
        return null;
    }
}

function getUsingScript() {
    const file = `${__dirname}/src/using.js`;

    if (!fs.existsSync(file))
        return '';

    try {
        const content = fs.readFileSync(file, 'utf8');
        return content;
    } catch (x) {
        return '';
    }
}

async function minify(body) {
    return new Promise(function (callback) {
        const querystring = require('querystring');
        const https = require('https');

        const query = querystring.stringify({
            input: body,
        });

        const req = https.request({
                method: 'POST',
                hostname: 'www.toptal.com',
                path: '/developers/javascript-minifier/api/raw',
            },
            function (res) {
                // if the statusCode isn't what we expect, get out of here
                if (res.statusCode !== 200) {
                    console.error('Error al minificar archivo', res.statusCode);
                    callback(null);
                    return;
                }

                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    console.info('Archivo minificado correctamente', body.length);
                    callback(body);
                });
            }
        );

        req.on('error', function (err) {
            console.error('Error al minificar archivo', err);
            callback(null);
        });

        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setHeader('Content-Length', query.length);
        req.end(query, 'utf8');
    });
}

async function compilar() {
    const libs = getLibs() || {};
    const libs_json = JSON.stringify(libs, null, 4).split("\n").map(function (str, idx) {
        if (idx > 0) return '    ' + str;
        return str;
    }).join("\n");
    const replace_str = '{ /* == PONER AQUÍ LAS LIBRERÍAS POR DEFECTO == */ }';
    const js = getUsingScript().replace(replace_str, libs_json);

    const dist = `${__dirname}/dist`;

    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
    }

    fs.writeFileSync(`${dist}/using.js`, js);

    const minified = await minify(js);

    if (minified !== null)
        fs.writeFileSync(`${dist}/using.min.js`, minified);

    console.log('Proceso completado', `${dist}/using.js`);
}

exports.default = compilar;