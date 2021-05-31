
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { parse: vueParse } = require('@vue/component-compiler-utils');

let aliasMap = {};
const supportExts = ['.js', '.ts', '.jsx', '.tsx', '.vue'];
const extList = ['.js', '.ts', '.json'];

// 存放访问过的文件，避免循环引用
let accessedFiles = new Set();
function isAccess (filePath) {
    if (accessedFiles.has(filePath)) {
        return true;
    }
    accessedFiles.add(filePath);
    return false;
}

function addSyntaxtPlugins (filePath) {
    const plugins = [];

    if (['.tsx', '.jsx'].some(ext => filePath.endsWith(ext))) {
        plugins.push('jsx');
    }
    if (['.tsx', '.ts'].some(ext => filePath.endsWith(ext))) {
        plugins.push('typescript');
    }

    return plugins;
}

function completeExt (subFilePath) {
    extList.find(ext => {
        let tryPath = subFilePath + ext;
        if (fs.existsSync(tryPath)) {
            subFilePath = tryPath;
            return true;
        }
        return false;
    });
    return subFilePath;
}

function isDir (filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (e) {}
    return false;
}

function completeFilePath (subFilePath, filePath) {

    // 相对路径
    if (/^\.{1,2}\//.test(subFilePath)) {
        subFilePath = path.resolve(path.dirname(filePath), subFilePath);
    }

    // 别名
    Object.keys(aliasMap).forEach(key => {
        if (subFilePath.startsWith(key))
            subFilePath = subFilePath.replace(key, aliasMap[key]);
    });

    // 忽略了文件后缀
    if (!/\.[a-zA-Z]+$/.test(subFilePath)) {
        if (isDir(subFilePath)) {
            subFilePath = completeExt(Path.join(subFilePath, 'index'));
        }
        subFilePath = completeExt(subFilePath);
    }

    return subFilePath;
}

function setResData (subModulePath, filePath, resData) {
    subModulePath = completeFilePath(subModulePath, filePath);
    !accessedFiles.has(subModulePath) && resData.nodes.push({
        id: subModulePath,
        tip: subModulePath.replace(process.cwd(), ''),
        label: path.basename(subModulePath)
    });
    resData.edges.push({
        source: filePath,
        target: subModulePath
    });
    traverseModule(subModulePath, resData);
}

function traverseModule (filePath, resData) {
    let flag = isAccess(filePath) ||
        !fs.existsSync(filePath) ||
        !supportExts.includes(path.extname(filePath));
    if (flag) {
        return;
    }
    let fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    let plugins = [];
    if (filePath.endsWith('.vue')) {
        let descriptor = vueParse({
            source: fileContent,
            compiler: require('vue-template-compiler'),
            needMap: false
        });
        fileContent = descriptor.script.content;
        descriptor.script.lang === 'ts' && plugins.push('typescript');
    }

    const ast = parser.parse(fileContent, {
        sourceType: 'unambiguous',
        plugins: plugins.concat(addSyntaxtPlugins(filePath))
    });

    traverse(ast, {
        ImportDeclaration (path) {
            let subModulePath = path.get('source.value').node;
            setResData(subModulePath, filePath, resData);
        },
        CallExpression (path) {
            let str = path.get('callee').toString();
            if (['require', 'import'].includes(str)) {
                let subModulePath = path.get('arguments.0').toString().replace(/['"]/g, '');
                setResData(subModulePath, filePath, resData);
            }
        }
    });
}

module.exports = (alias, filePath, resData) => {
    aliasMap = alias;
    traverseModule(filePath, resData);
};
