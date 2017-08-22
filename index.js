const types = require('babel-types');
const kebab = require('lodash.kebabcase');
const execSync = require('child_process').execSync;
const fs = require('fs');

var path = require('path');

function barf(msg) {
    throw new Error('babel-plugin-transform-imports: ' + msg);
}

function transform(transformOption, importName, special = {}) {
    var importNameLower = importName.toLowerCase();

    if (/\.js$/i.test(transformOption)) {
        var transformFn;

        try {
            transformFn = require(transformOption);
        } catch (error) {
            barf('failed to require transform file ' + transformOption);
        }

        if (typeof transformFn !== 'function') {
            barf('expected transform function to be exported from ' + transformOption);
        }

        return transformFn(importName);
    }

    if (importName in special) {
        importName = special[importName];
    }

    if (importNameLower in special) {
        importNameLower = special[importNameLower];
    }

    var res = transformOption.replace(/\$\{\s?member\s?\}/ig, importName).replace(/\$\{\s?member\-lowercase\s?\}/ig, importNameLower);

    return res;
}

module.exports = function() {
    return {
        visitor: {
            ImportDeclaration: function(path, state) {
                if (path.node.source.value in state.opts) {
                    var source = path.node.source.value;
                    var opts = state.opts[source];

                    if (!opts.transform) {
                        barf('transform option is required for module ' + source);
                    }

                    var transforms = [];

                    var fullImports = path.node.specifiers.filter(function(specifier) {
                        return specifier.type !== 'ImportSpecifier'
                    });
                    var memberImports = path.node.specifiers.filter(function(specifier) {
                        return specifier.type === 'ImportSpecifier'
                    });

                    if (fullImports.length > 0) {
                        if (opts.preventFullImport) {
                            barf('import of entire module ' + source + ' not allowed due to preventFullImport setting');
                        }

                        if (memberImports.length > 0) {
                            transforms.push(types.importDeclaration(fullImports, types.stringLiteral(source)));
                        }
                    }

                    memberImports.forEach(function(memberImport) {
                        var importName = memberImport.imported.name;
                        if (opts.kebabCase) {
                            importName = kebab(importName);
                        }

                        var replace = transform(opts.transform, importName, opts.special);

                        transforms.push(types.importDeclaration([types.importDefaultSpecifier(types.identifier(memberImport.local.name))], types.stringLiteral(replace)));

                        if (opts.style) {
                            const libCssName = transform(opts.style, memberImport.imported.name, opts.special);

                            // 添加样式文件，样式文件存在才添加，否则不添加
                            if (checkStyleFileIsExist(libCssName)) {
                                transforms.push(types.importDeclaration([], types.stringLiteral(libCssName)));
                            }
                        }
                    });

                    if (transforms.length > 0) {
                        path.replaceWithMultiple(transforms);
                    }
                }
            }
        }
    }
}

const rootPath = normalize();

function checkStyleFileIsExist(filePath) {
    let styleFilePath = path.join(rootPath, 'node_modules', filePath);

    return fs.existsSync(styleFilePath);
}

function normalize() {
    var projectPath;

    try {
        projectPath = execSync('git rev-parse --show-toplevel').toString().trim().replace(/\\n/g);

        if (process.platform === 'win32' || process.platform === 'win64') {
            projectPath = projectPath.replace(/\\/g, '/').replace(/^([A-Z]+:)(\/[^\/]+)/, '$1');
        }
    } catch (e) {
        projectPath = path.join(__dirname, '../../..');
    }

    return projectPath;
}
