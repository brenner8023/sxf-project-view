import resData from './data.js';

const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    itemTypes: ['node'],
    getContent: (e) => {
    const outDiv = document.createElement('div');
    outDiv.style.width = 'fit-content';
    outDiv.innerHTML = `
        <div style="font-weight: bold;">${e.item.getModel().tip}</div>
        <div>被引用计数：${e.item.getInEdges().length}</div>
    `;
    return outDiv;
    },
});

let $app = document.getElementById('app'),
    $searchInput = document.getElementById('node-search-input');

const graph = new G6.Graph({
    container: 'app',
    width: $app.scrollWidth,
    height: $app.scrollHeight,
    plugins: [tooltip],
    modes: {
        default: [
            'drag-canvas',
            'drag-node'
        ],
    },
    layout: {
        type: 'gForce',
        preventOverlap: true,
        nodeSize: 40,             // 可选
        gpuEnabled: true          // 可选，开启 GPU 并行计算，G6 4.0 支持
    },
    animate: true,
    defaultNode: {
        size: 40,
    },
    defaultEdge: {
        style: {
        endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#e2e2e2',
        },
        },
    }
});

graph.data(resData);
graph.render();

$searchInput.addEventListener('keyup', (e) => {
    if (e.code !== 'Enter') {
        return;
    }
    const targetNode = graph.find('node', (node) => {
        return node.get('model').tip.includes($searchInput.value);
    });
    graph.focusItem(targetNode, true, {
        easing: 'easeCubic',
        duration: 500,
    });
});

graph.on('node:mouseenter', (e) => {
    graph.setItemState(e.item, 'active', true);
});
graph.on('node:mouseleave', (e) => {
    graph.setItemState(e.item, 'active', false);
});
