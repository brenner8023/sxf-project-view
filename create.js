import resData from './data.js';

const graph = new G6.Graph({
    container: 'app',
    width: 1366,
    height: 800,
    modes: {
        default: [
        'drag-canvas', 'drag-node',
        {
            type: 'tooltip',
            formatText: function formatText(model) {
                return model.tip;
            },
            shouldUpdate: function shouldUpdate() {
                return true;
            },
        }
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
