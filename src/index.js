
const path = require('path');
const fs = require('fs');
const traverseModule = require('./traverse-module');

const defaultOptions = {
    entry: ['./demo/demo.js'],
    alias: {
        '$$': 'jquery',
        '$': 'jquery'
    }
};

function main (options) {
    let {
        entry: entries,
        alias: aliasMap
    } = Object.assign({}, defaultOptions, options);

    let errEntry = entries.find(entry => !fs.existsSync(entry));
    if (errEntry) {
        console.error(`entry输入错误，读取不到入口文件${errEntry}`);
        return false;
    }

    let resData = {
        nodes: [],
        edges: []
    };

    entries.forEach(entry => {
        let entryPath = path.resolve(entry);

        resData.nodes.push({
            id: entryPath,
            tip: entryPath.replace(process.cwd(), ''),
            style: {
                fill: '#BDEFDB'
            },
            type: 'rect',
            label: path.basename(entryPath)
        });
        traverseModule(aliasMap, entryPath, resData);
    });

    return resData;
}

let result = main({});
fs.writeFileSync('./data.js', `export default ${JSON.stringify(result, null, 4)}`);
