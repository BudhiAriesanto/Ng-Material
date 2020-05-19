
// import('./hammerjs');
import { Hammer } from './hammerjs';
require('./ngLayout/layout.js');
import './ngLayout/layout.scss';
// require('./core/gesture');
require('./ng-material-core.js');
import './style/ng-material-core.scss';
require('./ng-material');


export const core = require('./core');

export { Hammer };
console.log((<any>window).ng);


