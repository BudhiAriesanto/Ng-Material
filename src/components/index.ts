import { NgModule } from 'angular-ts-decorators';

const context = require.context('../components', true, /^(?!.*theme.scss)(?!.*style\/)((.*\.(js|scss))[^.]*$)/);
context.keys().forEach((key) => {
    // if (key.match(/((.*\.(js))[^.]*$)/)) { module.exports = context(key); }
    // console.log(key);
    // export const a = require(key);
    if (key.match(/((.*\.(js))[^.]*$)/)) { context(key); }
});

@NgModule({
  id: 'ng.material.component',
  imports: [
    'ng.material.core',
    'material.components.backdrop',
    'material.components.panel',
    'material.components.sidenav',
    'material.components.checkbox',
    'material.components.input',
    'material.components.icon',
    'material.components.button',
    'material.components.progressLinear',
    'material.components.tooltip',
    'material.components.menu'
  ]
})
export default class MaterialComponent {
  static config() {
    'ngInject';
  }
  static run() {
    'ngInject';
  }
}
