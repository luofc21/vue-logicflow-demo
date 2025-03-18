import { h } from '@logicflow/core';

export const serviceTaskIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('rect', {
    x: 2,
    y: 2,
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  }),
  h('path', {
    d: 'M16.2 8c0-.66-.54-1.2-1.2-1.2-.66 0-1.2.54-1.2 1.2v1.2h1.2c.66 0 1.2-.54 1.2-1.2zM8 9.2h1.2c.66 0 1.2-.54 1.2-1.2 0-.66-.54-1.2-1.2-1.2-.66 0-1.2.54-1.2 1.2v1.2z',
    fill: 'rgb(34, 36, 42)'
  }),
  h('path', {
    d: 'M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    fill: 'rgb(34, 36, 42)'
  }),
  h('path', {
    d: 'M15 12c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z',
    fill: 'rgb(34, 36, 42)'
  })
]);

export const userTaskIcon = {
  tagName: 'svg',
  attrs: {
    viewBox: '0 0 24 24',
    width: '24',
    height: '24'
  },
  children: [
    {
      tagName: 'path',
      attrs: {
        d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
        fill: 'currentColor'
      }
    }
  ]
}

export const processTaskIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('rect', {
    x: 2,
    y: 2,
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  }),
  h('path', {
    d: 'M6 12h12',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  })
]);

export const milestoneIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('circle', {
    cx: 12,
    cy: 12,
    r: 10,
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  }),
  h('circle', {
    cx: 12,
    cy: 12,
    r: 4,
    fill: 'rgb(34, 36, 42)'
  })
]);

export const eventListenerIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('path', {
    d: 'M12 2C8.13 2 5 5.13 5 9v5l-1.29 1.29a1 1 0 00-.21 1.09c.18.5.68.82 1.21.82h14.17c.53 0 1.03-.32 1.21-.82a1 1 0 00-.21-1.09L19 14V9c0-3.87-3.13-7-7-7z',
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  }),
  h('path', {
    d: 'M9 21h6',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  })
]);

export const entryCriterionIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('path', {
    d: 'M4 12h16',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  }),
  h('path', {
    d: 'M10 8l-4 4 4 4',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  })
]);

export const exitCriterionIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('path', {
    d: 'M20 12H4',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  }),
  h('path', {
    d: 'M14 8l4 4-4 4',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2,
    fill: 'none'
  })
]);

export const casePlanModelIcon = h('svg', {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24'
}, [
  h('rect', {
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  }),
  h('polyline', {
    points: "3,3 3,9 9,3",
    fill: 'none',
    stroke: 'rgb(34, 36, 42)',
    strokeWidth: 2
  })
]);

export const stageIcon = {
  tagName: 'svg',
  attrs: {
    viewBox: '0 0 24 24',
    width: '24',
    height: '24'
  },
  children: [
    {
      tagName: 'rect',
      attrs: {
        x: '2',
        y: '2',
        width: '20',
        height: '20',
        fill: 'none',
        stroke: 'rgb(34, 36, 42)',
        strokeWidth: '2'
      }
    },
    {
      tagName: 'path',
      attrs: {
        d: 'M6 6h12M6 12h12M6 18h12',
        stroke: 'rgb(34, 36, 42)',
        strokeWidth: '2',
        fill: 'none'
      }
    }
  ]
}
