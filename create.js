import resData from './data.js';

const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    itemTypes: ['node'],
    getContent: (e) => {
    const outDiv = document.createElement('div');
    outDiv.style.width = 'fit-content';
    //outDiv.style.padding = '0px 0px 20px 0px';
    outDiv.innerHTML = `
        <span>${e.item.getModel().tip}</span>`;
    return outDiv;
    },
});

const graph = new G6.Graph({
    container: 'app',
    width: 1366,
    height: 800,
    plugins: [tooltip],
    modes: {
        default: [
            'drag-canvas',
            'drag-node'
        ],
    },
    layout: {
        type: 'radial',
        unitRadius: 100,
        nodeSpacing: 100,
        preventOverlap: true,
        strictRadial: false,
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

graph.on('node:mouseenter', (e) => {
    graph.setItemState(e.item, 'active', true);
});
graph.on('node:mouseleave', (e) => {
    graph.setItemState(e.item, 'active', false);
});
