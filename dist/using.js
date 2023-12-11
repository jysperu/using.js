var Promise, define;

; (function () {
    'use strict';

    let AsyncUsing, Using, WhenUsed;

    let config = {
        debug: false,
    };

    /** Variables a reemplazar al cnk de la función define */
    const commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;


    var onDefinedPromiseCbk = noop,
        lastAnonDefined = null;

    var NodosPromises = {};
    var UltimoNodo = FakePromise();
    var UltimoNodoDefine = null;

    var WhenDefinedPrms = {};
    var WhenDefinedCbks = {};

    /** Revisar si ya existe un array Using con la configuración nueva */
    if (typeof window.Using !== 'undefined' && isObject(window.Using)) {
        extend(config, window.Using);
        debug('global', 'Config global registrado');
    }


    /** Declarando la función AsyncUsing */
    AsyncUsing = window.AsyncUsing = async function AsyncUsing() {
        var libs = [];

        debug('Using', 'Creando instancia', arguments);

        const each_args = async function (arg) {
            if (is_function(arg)) {
                /** Las funciones enviadas como parámetro tambien pueden retorna una función que será utilizada como librería */
                const lib = arg.apply(null, libs);
                libs.push(lib);
                return;
            }

            if (is_string(arg)) {
                if (arg.trim().length !== 0)
                    libs.push(await GetLib(arg));
                return;
            }

            if (is_array(arg)) {
                await async_each(arg, each_args);
            }
        };

        await async_each(arguments, each_args);

        debug('Using', 'Func completado satisfactoriamente', arguments);
        return libs;
    };


    /** Declarando la función Using */
    Using = window.Using = function Using() {
        const libs = AsyncUsing.apply(null, arguments);
        return FakePromise(libs);
    }

    window.using = window.Using;


    /** Estableciendo el atributo de configuración editable de forma global */
    Using.config = {};

    /** Estableciendo el atributo que contendrá las librerías disponibles */
    Using.libs = {
        "jquery": {
            "define": "jQuery",
            "files": "https://code.jquery.com/jquery-3.7.1.min.js",
            "global": true
        },
        "bootstrap": {
            "files": [
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
            ]
        },
        "bs5": "bootstrap",
        "@popperjs/core": {
            "define": "Popper",
            "files": [
                "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
            ],
            "global": true
        },
        "popper": "@popperjs/core",
        "moment": {
            "define": "moment",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/locale/es.min.js"
            ],
            "global": true
        },
        "momentjs": "moment",
        "moment.js": "moment",
        "sweetalert2": {
            "define": "Sweetalert2",
            "files": "https://cdn.jsdelivr.net/npm/sweetalert2@11"
        },
        "sweetalert": "sweetalert2",
        "swal": "sweetalert2",
        "toastr": {
            "define": "toastr",
            "deps": [
                "jquery"
            ],
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css"
            ]
        },
        "jquery-validate": {
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/jquery.validate.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/additional-methods.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/localization/messages_es_PE.min.js"
            ],
            "deps": [
                "jquery"
            ]
        },
        "jquery.validate": "jquery-validate",
        "jquery.validate.min": "jquery-validate",
        "validate": "jquery-validate",
        "jquery-cookie": {
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"
            ],
            "deps": [
                "jquery"
            ]
        },
        "jquery.cookie": "jquery-cookie",
        "cookie": "jquery-cookie",
        "signature_pad": {
            "define": "SignaturePad",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/signature_pad/4.1.7/signature_pad.umd.min.js"
            ]
        },
        "signaturepad": "signature_pad",
        "signature": "signature_pad",
        "autosize": {
            "define": "autosize",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/autosize.js/6.0.1/autosize.min.js"
            ]
        },
        "bootstrap-maxlength": {
            "deps": [
                "jquery"
            ],
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-maxlength/1.10.0/bootstrap-maxlength.min.js"
            ]
        },
        "maxlength": "bootstrap-maxlength",
        "clipboard": {
            "define": "ClipboardJS",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js"
            ]
        },
        "clipboard.js": "clipboard",
        "tempus-dominus": {
            "define": "tempusDominus",
            "files": [
                "https://cdn.jsdelivr.net/npm/@eonasdan/tempus-dominus@6.7.19/dist/js/tempus-dominus.min.js",
                "https://cdn.jsdelivr.net/npm/@eonasdan/tempus-dominus@6.7.19/dist/css/tempus-dominus.min.css"
            ],
            "deps": [
                "@popperjs/core"
            ]
        },
        "tempusdominus": "tempus-dominus",
        "datepicker-tempus-dominus": "tempus-dominus",
        "flatpickr": {
            "define": "flatpickr",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/es.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css"
            ]
        },
        "datepicker-flatpickr": "flatpickr",
        "daterangepicker": {
            "define": "daterangepicker",
            "files": [
                "https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js",
                "https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css"
            ],
            "deps": [
                "jquery",
                "moment"
            ]
        },
        "dropzone": {
            "files": [
                "https://unpkg.com/dropzone@5/dist/min/dropzone.min.css",
                "https://unpkg.com/dropzone@5/dist/min/dropzone.min.js"
            ]
        },
        "jquery-mask": {
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"
            ],
            "deps": [
                "jquery"
            ]
        },
        "jquery.mask": "jquery-mask",
        "mask": "jquery-mask",
        "vuejs": {
            "define": "Vue",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.11/vue.global.prod.min.js"
            ]
        },
        "vue": "vuejs",
        "vue.js": "vuejs",
        "select2": {
            "files": [
                "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css",
                "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"
            ]
        },
        "tagify": {
            "define": "Tagify",
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/tagify/4.17.9/tagify..js",
                "https://cdnjs.cloudflare.com/ajax/libs/tagify/4.17.9/tagify.min.css"
            ],
            "global": true
        },
        "jquery.tagify": {
            "files": [
                "https://cdnjs.cloudflare.com/ajax/libs/tagify/4.17.9/jQuery.tagify.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/tagify/4.17.9/tagify.min.css"
            ],
            "deps": [
                "jquery"
            ]
        }
    };

    extend(Using.config, {
        xhtml: false,
        scripttype: 'text/javascript',
        styletype: 'text/css',
        charset: 'utf-8',
        base: detect_base(),
    }, config);

    config = Using.config; // assoc

    Using.libs.require = { Script: Using };
    Using.libs.exports = { Script: {} };
    Using.libs.add = function (name, func, ...files) {
        if (is_function(func)) {
            return SetLibScript(name, func);
        }

        files.unshift(func);

        const path = {
            files: files
        };
        Using.libs[name] = path
        return path;
    };
    Using.libs.remove = function (name) {
        if (Using.libs[name])
            delete Using.libs[name];
        return true;
    };


    /** Estableciendo la función define, si existe entonces será reemplazado */
    window.define = async function UsingDefine(name, deps = [], callback = noop) {
        /** Reparando parámetros recibidos */
        if (is_function(name)) {
            callback = name;
            name = null;
        }

        if (is_function(deps)) {
            callback = deps;
            deps = [];
        }

        if (is_array(name)) {
            deps = name;
            name = null;
        }

        if (!is_array(deps)) {
            deps = [];
        }

        if (!is_string(name)) {
            name = UltimoNodoDefine;
        }

        UltimoNodoDefine = null;

        if (!is_function(callback)) {
            callback = noop;
        }

        debug('define', name, deps, callback);

        /** Si ya tiene un nombre entonces debería procesar el siguiente nodo y no esperar */
        if (name !== null) {
            lastAnonDefined = undefined;
            onDefinedPromiseCbk();
            debug('define', name, 'onDefinedPromiseCbk');
        }

        /** Limpiar de comentarios y añadir el require y/o exports */
        if (deps.length === 0 && is_function(callback)) {
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, function (match, singlePrefix) { return singlePrefix || ''; })
                    .replace(cjsRequireRegExp, function (match, dep) { deps.push(dep); });

                deps = (callback.length === 1 ? ['require'] : ['require', 'exports'])
                    .concat(deps);
            }
        }

        debug('define', name, 'deps', deps);

        let exports = {};
        Using.libs.exports = exports;

        if (deps.length > 0)
            deps = await AsyncUsing(deps);

        let func = callback.apply(null, deps);

        if (!func)
            func = exports;

        debug('define', name, 'func', func);

        if (name !== null) {
            debug('define', name, 'SetLibScript');
            SetLibScript(name, func);


            if (WhenDefinedCbks[name])
                WhenDefinedCbks[name](func);

            return;
        }

        lastAnonDefined = func;
        debug('define', name, 'onDefinedPromiseCbk');
        onDefinedPromiseCbk();
    };

    window.define.amd = {};

    /** Estableciendo la función WhenDefined y ondefined */
    window.WhenDefined = window.ondefined = function WhenDefined(name, func) {
        if (!WhenDefinedPrms[name]) {
            WhenDefinedPrms[name] = new Promise(function (callback) {
                WhenDefinedCbks[name] = function (lib) {
                    callback(lib);
                    delete WhenDefinedCbks[name];
                };
            });
        }

        if (is_function(func))
            WhenDefinedPrms[name].then(func);

        return WhenDefinedPrms[name];
    };

    async function WaitingDefined(_define) {
        var tmo = 0;

        return new Promise(function (callback) {
            onDefinedPromiseCbk = function () {
                clearInterval(tmo);
                callback();
                onDefinedPromiseCbk = noop;
            };

            // En caso no se detecte un define en los 02 segundos siguientes se ejecuta de forma automática
            let veces = 0;

            tmo = setInterval(function () {
                veces++;

                if (window[_define]) {
                    debug('WaitingDefined', 'autodetectado', _define, window[_define], veces);
                    lastAnonDefined = window[_define];
                    onDefinedPromiseCbk();
                    return;
                }

                debug('WaitingDefined', 'interval', veces, _define, window[_define]);

                if (veces >= 3)
                    onDefinedPromiseCbk();
            }, 0.5 * 1000);
        });
    }

    async function GetLib(lib) {
        debug('GetLib', 'Buscar lib', lib);

        if (typeof lib === 'undefined' || lib === null || lib.toString().trim() === '')
            return null;

        if (is_function(lib))
            return lib;

        /** Obteniendo el path del lib */
        const path = GetLibPath(lib);

        /** Comprobando si ha sido encontrado, debe retornar un object */
        if (path === null)
            return null;

        if (typeof path.Script !== 'undefined') {
            debug('GetLib', 'Lib `' + lib + '` ya tiene un SCRIPT', path.Script);
            return path.Script;
        }

        /** Buscar si el valor del atributo define del path ya existe como variable global */
        const define = path.define || lib;

        if (typeof window[define] !== 'undefined') {
            debug('GetLib', 'Lib `' + lib + '` ha sido definido como variable global previamente', define, window[define]);
            return window[define];
        }

        /** Comprobar si alguien mas está buscando la librería */
        if (path.GettingLib) {
            debug('GetLib', 'Alguien mas busca el lib `' + lib + '`');
            return new Promise(function (callback) {
                path.GettingLib.then(callback);
            });
        }

        if (define !== lib) {
            debug('GetLib', 'Lib `' + lib + '` es diferente al define', define);
            Using.libs[define] = path;
        }

        /** Promise que descargará el lib como archivo */
        const promise = new Promise(async function (callback) {
            const deps = path.deps || null;

            if (deps !== null) {
                debug('GetLib', 'Lib `' + lib + '` tiene dependencias', deps);

                if (is_string(deps))
                    deps = [deps];

                await AsyncUsing.apply(null, deps);
                debug('GetLib', 'Dependencias del `' + lib + '` listas', deps);
            }

            if (typeof path.files !== 'undefined' && is_string(path.files)) {
                path.files = [path.files];
            }

            const files = path.files || [];

            if (typeof path.css !== 'undefined') {
                if (is_string(path.css))
                    files.push(path.css);
                else if (is_array(path.css))
                    each(path.css, function (uri) {
                        files.push(uri);
                    });
            }

            if (typeof path.js !== 'undefined') {
                if (is_string(path.js))
                    files.push(path.js);
                else if (is_array(path.js))
                    each(path.js, function (uri) {
                        files.push(uri);
                    });
            }

            path.DefineCbk = function () {
                debug('GetLib', 'path.DefineCbk', lib);
                callback(path.Script);
            };

            debug('GetLib', 'Agregando los scripts y estilos del lib `' + lib + '`', files);
            await LoadNodos(files, define);
            debug('GetLib', 'Scripts y estilos del `' + lib + '` han sido leídos');

            // callback(path.Script);
        });

        path.GettingLib = promise;

        /** Esperando que termine el Promise */
        const timestart = now();
        const func = await promise;
        const timeend = now();
        const timetotal = (timeend - timestart) / 1000; // segs

        debug('GetLib', 'Lib `' + lib + '` obtenido', 'Tiempo: ' + timetotal + ' seg(s)');

        return func;
    }

    function GetLibPath(lib) {
        if (!is_string(lib)) {
            debug('GetLibPath', 'El lib buscado debe ser tipo texto', lib);
            return null;
        }

        if (/^(https?\:)?\/\//i.test(lib)) {
            debug('GetLibPath', 'El lib es una URL', lib);
            if (!Using.libs[lib]) {
                Using.libs[lib] = {
                    files: [lib],
                };
            }
            return Using.libs[lib];
        }

        const path = Using.libs[lib];

        if (typeof path === 'undefined') {
            let tmppath;

            /** Comprobar si se encuentra lib en minúsculas */
            tmppath = lib.toLowerCase();
            debug('GetLibPath', 'Intentando como', tmppath);

            if (Using.libs[tmppath])
                return GetLibPath(tmppath);

            /** Comprobar si se encuentra lib sin ruta de directorio */
            tmppath = lib.replace(/^(\.+\/)+/, '');
            debug('GetLibPath', 'Intentando como', tmppath);

            if (Using.libs[tmppath])
                return GetLibPath(tmppath);

            /** No se encontró */
            debug('GetLibPath', '[' + lib + ']', 'El path del lib no ha sido encontrado');
            return null;
        }

        debug('GetLibPath', '[' + lib + ']', 'Path encontrado', path);

        if (!is_string(path))
            return path;

        debug('GetLibPath', '[' + lib + ']', 'El path es string, comprobando si es un alias');

        if (Using.libs[path])
            return GetLibPath(path);

        debug('GetLibPath', '[' + lib + ']', 'El path es string y no es un alias, comprobando variable global');

        if (window[path]) {
            Using.libs[lib] = { define: path };
            return Using.libs[lib];
        }

        debug('GetLibPath', '[' + lib + ']', 'El path no es un alias ni una variable global por ende es un archivo');

        Using.libs[lib] = { files: [path] };
        return Using.libs[lib];
    }

    function SetLibScript(name, func) {
        debug('SetLibScript', name, func);

        const path = GetLibPath(name);

        if (path === null) {
            Using.libs[name] = {
                Script: func,
            };

            return Using.libs[name];
        }

        path.Script = func;

        if (path.DefineCbk)
            path.DefineCbk();

        if (path.global && path.define)
            window[path.define] = path.Script;

        return path
    }

    async function LoadNodo(uri, define) {
        if (!is_string(uri))
            return null;

        debug('LoadNodo', 'Cargar nodo', uri);

        const css = /\.css(\?(.*))?$/gi.test(uri);
        const nodo = css ? createCssNodo(uri) : createJsNodo(uri);

        nodo.append2html = function () {
            let element = document.getElementsByTagName(css ? 'head' : 'body')[0];
            if (!css && !element) element = document.getElementsByTagName('head')[0];
            if (!element) element = document.getElementsByTagName('html')[0];
            element.appendChild(this);
            debug('LoadNodo', '[append2html]', this);
            this.append2html = noop;
        };

        nodo.define = define;

        if (css) {
            nodo.append2html();
            return nodo;
        }

        /** Comprobar si alguien mas está buscando la librería */
        if (NodosPromises[uri]) {
            debug('LoadNodo', 'Alguien mas está cargando o ha cargado el nodo `' + uri + '`');

            return new Promise(function (callback) {
                NodosPromises[uri].then(callback);
            });
        }

        var promiseCbk = null,
            WaitingDefinedPromise = null;

        const promise = new Promise(async function (callback) {
            promiseCbk = callback;

            nodo.on_success = function () {
                /** Esperar un define previo al callback */
                WaitingDefinedPromise.then(function () {
                    if (lastAnonDefined) {
                        SetLibScript(nodo.define, lastAnonDefined);
                        lastAnonDefined = undefined;
                    }

                    callback();
                });
            };

            nodo.on_error = function () {
                callback();
            };

            try {
                nodo.attachEvent('onreadystatechange', nodo.on_success);
            }
            catch (e) { }

            try {
                nodo.addEventListener('load', nodo.on_success, false);
                nodo.addEventListener('error', nodo.on_error, false);
            }
            catch (e) { }
        });

        NodosPromises[uri] = promise;
        UltimoNodo.then(function () {
            UltimoNodoDefine = define;
            debug('LoadNodo', 'Agregando nodo', uri, now());

            if (UltimoNodoDefine)
                WaitingDefinedPromise = WaitingDefined(UltimoNodoDefine);
            else
                WaitingDefinedPromise = FakePromise();

            nodo.append2html();
        });
        UltimoNodo = promise;


        /** Esperando que termine el Promise */
        const timestart = now();
        await promise;
        const timeend = now();
        const timetotal = (timeend - timestart) / 1000; // segs

        debug('LoadNodo', 'Nodo agregado', 'Tiempo: ' + timetotal + ' seg(s)', uri, now());

        return nodo;
    };

    async function LoadNodos(uris, define) {
        if (!uris.length)
            return;

        const key = now().toString().substring(10);
        var total = uris.length;

        debug('LoadNodos', '[' + key + ']', 'Cargar ' + total + ' nodos', uris);

        return new Promise(function (callback) {
            const nodo_loaded = function () {
                total--;

                debug('LoadNodos', '[' + key + ']', 'Nodo cargado, Pendientes: ' + total);

                if (total === 0)
                    callback();
            }


            each(uris, function (uri) {
                const css = /\.css(\?(.*))?$/gi.test(uri);

                if (css) {
                    LoadNodo(uri);
                    nodo_loaded(); // será leído de forma asíncroniza así que es innecesario esperar
                    return;
                }

                LoadNodo(uri, define)
                    .then(nodo_loaded);

                define = null; // El valor del define solo lo obtiene el primer archivo JS
            });
        });
    };

    function FakePromise(callback_data) {
        class func {
            constructor() {
                const that = this;

                that.then = function (callback) {
                    callback.apply(null, callback_data);
                };

                that.catch = noop;
                that.finally = that.then;
                that.do = that.then;
                that.done = that.then;
                that.error = that.catch;
                that.always = that.finally;

                return callback_data;
            }
        }

        return new func;
    }

    function createCssNodo(uri) {
        var nodo = Using.config.xhtml ?
            document.createElementNS('http://www.w3.org/1999/xhtml', 'html:link') :
            document.createElement('link');

        nodo.rel = 'stylesheet';
        nodo.type = Using.config.styletype;
        nodo.charset = Using.config.charset;
        // Los estilos no deberían afectar a la carga de la página
        nodo.async = true;
        nodo.href = uri;

        return nodo;
    }

    function createJsNodo(uri) {
        var nodo = Using.config.xhtml ?
            document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
            document.createElement('script');

        nodo.type = Using.config.scripttype;
        nodo.charset = Using.config.charset;
        // Los archivos JS son necesarios ser leídos de forma sincronizada
        nodo.src = uri;

        return nodo;
    }

    function detect_base() {
        const tag = document.getElementsByTagName('base');

        if (tag.length > 0)
            return tag[0].href;

        if (location.origin)
            return location.origin;

        return location.href
            .replace(location.pathname, '')
            .split('?')[0]
            .split('#')[0];
    }

    async function noop() { };

    async function debug(bloque, ...messages) {
        if (!config.debug)
            return;

        messages.unshift('[' + bloque + ']');
        messages.unshift('[' + now().toString().substring(8) + ']');
        messages.unshift('color: red; font-weight: bolder');
        messages.unshift('%c[using.js]');
        console.log.apply(null, messages);
    }

    function check_val_type(val, type) {
        type = '[object ' + type + ']';
        return Object.prototype.toString.call(val) === type;
    }

    function is_function(val) {
        return check_val_type(val, 'Function');
    }

    function is_array(val) {
        return check_val_type(val, 'Array');
    }

    function is_string(val) {
        return check_val_type(val, 'String');
    }

    function is_object(val) {
        return check_val_type(val, 'Object');
    }

    function now() {
        return Date.now();
    }

    function each(arr, callback) {
        var i;

        if (is_array(arr)) {
            for (i = 0; i < arr.length; i++) {
                if (arr[i] && callback(arr[i], i, arr))
                    break;

            }
            return;
        }

        for (i in arr) {
            if (arr[i] && callback(arr[i], i, arr))
                break;
        }
    }

    async function async_each(arr, callback) {
        var i;

        if (is_array(arr)) {
            for (i = 0; i < arr.length; i++)
                if (arr[i] && await callback(arr[i], i, arr))
                    break;
            return;
        }

        for (i in arr) {
            if (arr[i] && await callback(arr[i], i, arr))
                break;
        }
    }

    function extend(arr, ...arrs) {
        var ret = arr;

        each(arrs, function (arr2) {
            each(arr2, function (v, k) {
                if (is_array(v) || is_object(v)) {
                    if (typeof ret[k] === 'undefined')
                        ret[k] = v;

                    ret[k] = extend(ret[k], v);
                    return;
                }

                ret[k] = v;
            });
        });

        return ret;
    }

    async function sleep(secs = 0) {
        return new Promise(function (callback) {
            setTimeout(callback, secs * 1000);
        });
    }
}());