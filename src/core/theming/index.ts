import * as ng from 'angular';
import { NgModule } from 'angular-ts-decorators';
import { NgProvider, method } from '../decorator';
import { MdMetaProvider } from '../meta';
import { IMdColorPalette, IMdThemingPalette } from './pallete';
interface IThemeInjectFunction {
  [a: string]: any;
}
class Theme implements IThemeInjectFunction {
  public colors: any = {};
  public isDark: boolean;
  public foregroundPalette: any;
  public foregroundShadow: any;
  constructor(private name: string, private pallete: IMdThemingPalette) {
    // asdsad
    this.setDark(false);
    let self: any = this as any;
  }
  public setDark(isDark: boolean = true): Theme {
    // this.isDark = arguments.length === 0 ? true : !!isDark;

    // If no change, abort
    if (isDark === this.isDark) { return this; }

    this.isDark = isDark;
    let {LIGHT_FOREGROUND, DARK_FOREGROUND, DARK_SHADOW, LIGHT_SHADOW, LIGHT_DEFAULT_HUES, DARK_DEFAULT_HUES} =  this.pallete;
    this.foregroundPalette = this.isDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
    this.foregroundShadow = this.isDark ? DARK_SHADOW : LIGHT_SHADOW;

    // Light and dark themes have different default hues.
    // Go through each existing color type for this theme, and for every
    // hue value that is still the default hue value from the previous light/dark setting,
    // set it to the default hue value from the new light/dark setting.
    const newDefaultHues = this.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES;
    const oldDefaultHues = this.isDark ? LIGHT_DEFAULT_HUES : DARK_DEFAULT_HUES;
    // let self = this;
    ng.forEach(newDefaultHues, (newDefaults: any, colorType: any) => {
      const color = this.colors[colorType];
      const oldDefaults = oldDefaultHues[colorType];
      if (color) {
        for (const hueName in color.hues) {
          if (color.hues[hueName] === oldDefaults[hueName]) {
            color.hues[hueName] = newDefaults[hueName];
          }
        }
      }
    });

    return this;
  }
}

export class MdThemingProvider {
  protected $$mdMetaProvider: MdMetaProvider;
  protected $mdThemingPalette: IMdThemingPalette;
  protected $mdColorPalette: any;
  protected PALETTES: IMdColorPalette;
  protected THEMES: any = { };

  constructor(protected $injector?: ng.auto.IInjectorService) {
    'ngInject';
    // $injector.modules = ['material.core.js'];
    this.$mdThemingPalette = $injector.get('$mdThemingPalette');
    this.$mdColorPalette = $injector.get('$mdColorPalette');
    this.$$mdMetaProvider = $injector.get('$$mdMetaProvider');
    this.PALETTES = Object.assign(this.PALETTES || {} , this.$mdColorPalette);
  }

  /**
   * Adds `theme-color` and `msapplication-navbutton-color` meta tags with the color parameter
   * @param {string} color Hex value of the wanted browser color
   * @returns {function} Remove function of the meta tags
   */
  protected setBrowserColor(color: any) {
    // Chrome, Firefox OS and Opera
    const removeChrome = this.$$mdMetaProvider.setMeta('theme-color', color);
    // Windows Phone
    const removeWindows = this.$$mdMetaProvider.setMeta('msapplication-navbutton-color', color);

    return function () {
      removeChrome();
      removeWindows();
    };
  }
  /**
   * @ngdoc method
   * @name $mdThemingProvider#enableBrowserColor
   * @description
   * Enables browser header coloring. For more info please visit
   * <a href="https://developers.google.com/web/fundamentals/design-and-ui/browser-customization/theme-color">
   *   Web Fundamentals</a>.
   * @param {object=} options Options for the browser color, which include:<br/>
   * - `theme` - `{string}`: A defined theme via `$mdThemeProvider` to use the palettes from. Default is `default` theme. <br/>
   * - `palette` - `{string}`:  Can be any one of the basic material design palettes, extended defined palettes, or `primary`,
   *  `accent`, `background`, and `warn`. Default is `primary`.<br/>
   * - `hue` -  `{string}`: The hue from the selected palette. Default is `800`.<br/>
   * @returns {function} Function that removes the browser coloring when called.
   */
  protected enableBrowserColor (options: any) {
    options = ng.isObject(options) ? options : {};

    const theme = options.theme || 'default';
    const hue = options.hue || '800';

    const palette = (<any>this.PALETTES)[options.palette] ||
      (<any>this.PALETTES)[this.THEMES[theme].colors[options.palette || 'primary'].name];

    let color: string = ng.isObject(palette[hue]) ? palette[hue].hex : palette[hue];
    if (color.substr(0, 1) !== '#') {
      color = '#' + color;
    }
    return this.setBrowserColor(color);
  }
  // Make sure that palette has all required hues
  private checkPaletteValid(name: any, map: any) {
    let { VALID_HUE_VALUES } = this.$mdThemingPalette;
    const missingColors = VALID_HUE_VALUES.filter((field: string) => {
      return !map[field];
    });
    if (missingColors.length) {
      throw new Error('Missing colors %1 in palette %2!'
                      .replace('%1', missingColors.join(', '))
                      .replace('%2', name));
    }

    return map;
  }
  /**
   * @ngdoc method
   * @name $mdThemingProvider#definePalette
   * @description
   * In the event that you need to define a custom color palette, you can use this function to
   * make it available to your theme for use in its intention groups.<br>
   * Note that you must specify all hues in the definition map.
   * @param {string} name Name of palette being defined
   * @param {object} map Palette definition that includes hue definitions and contrast colors:
   * - `'50'` - `{string}`: HEX color
   * - `'100'` - `{string}`: HEX color
   * - `'200'` - `{string}`: HEX color
   * - `'300'` - `{string}`: HEX color
   * - `'400'` - `{string}`: HEX color
   * - `'500'` - `{string}`: HEX color
   * - `'600'` - `{string}`: HEX color
   * - `'700'` - `{string}`: HEX color
   * - `'800'` - `{string}`: HEX color
   * - `'900'` - `{string}`: HEX color
   * - `'A100'` - `{string}`: HEX color
   * - `'A200'` - `{string}`: HEX color
   * - `'A400'` - `{string}`: HEX color
   * - `'A700'` - `{string}`: HEX color
   * - `'contrastDefaultColor'` - `{string}`: `light` or `dark`
   * - `'contrastDarkColors'` - `{string[]}`: Hues which should use dark contrast colors (i.e. raised button text).
   *  For example: `['50', '100', '200', '300', '400', 'A100']`.
   * - `'contrastLightColors'` - `{string[]}`: Hues which should use light contrast colors (i.e. raised button text).
   *  For example: `['500', '600', '700', '800', '900', 'A200', 'A400', 'A700']`.
   */
  @method
  public definePalette(name: any, map: any): MdThemingProvider {
    map = map || {};
    (<any>this.PALETTES)[name] = this.checkPaletteValid(name, map);
    return this;
  }
  /**
   * @ngdoc method
   * @name $mdThemingProvider#extendPalette
   * @description
   * Sometimes it is easier to extend an existing color palette and then change a few properties,
   * rather than defining a whole new palette.
   * @param {string} name Name of palette being extended
   * @param {object} map Palette definition that includes optional hue definitions and contrast colors:
   * - `'50'` - `{string}`: HEX color
   * - `'100'` - `{string}`: HEX color
   * - `'200'` - `{string}`: HEX color
   * - `'300'` - `{string}`: HEX color
   * - `'400'` - `{string}`: HEX color
   * - `'500'` - `{string}`: HEX color
   * - `'600'` - `{string}`: HEX color
   * - `'700'` - `{string}`: HEX color
   * - `'800'` - `{string}`: HEX color
   * - `'900'` - `{string}`: HEX color
   * - `'A100'` - `{string}`: HEX color
   * - `'A200'` - `{string}`: HEX color
   * - `'A400'` - `{string}`: HEX color
   * - `'A700'` - `{string}`: HEX color
   * - `'contrastDefaultColor'` - `{string}`: `light` or `dark`
   * - `'contrastDarkColors'` - `{string[]}`: Hues which should use dark contrast colors (i.e. raised button text).
   *  For example: `['50', '100', '200', '300', '400', 'A100']`.
   * - `'contrastLightColors'` - `{string[]}`: Hues which should use light contrast colors (i.e. raised button text).
   *  For example: `['500', '600', '700', '800', '900', 'A200', 'A400', 'A700']`.
   *  @returns {object} A new object which is a copy of the given palette, `name`,
   *    with variables from `map` overwritten.
   */
  @method
  public extendPalette(name: any, map: any) {
    return this.checkPaletteValid(name,  Object.assign({}, this.PALETTES[name] || {}, map) );
  }
  /**
   * @ngdoc method
   * @name $mdThemingProvider#theme
   * @description
   * Register a theme (which is a collection of color palettes); i.e. `warn`, `accent`,
   * `background`, and `primary`.<br>
   * Optionally inherit from an existing theme.
   * @param {string} name Name of theme being registered
   * @param {string=} inheritFrom Existing theme name to inherit from
   */
  @method
  public theme(name: any, inheritFrom: any = 'default') {
    if (this.THEMES[name]) {
      return this.THEMES[name];
    }

    // inheritFrom = inheritFrom || 'default';

    const parentTheme = typeof inheritFrom === 'string' ? this.THEMES[inheritFrom] : inheritFrom;
    const theme = new Theme(name, this.$mdThemingPalette);

    if (parentTheme) {
      ng.forEach(parentTheme.colors, function(color: any, colorType: any) {
        theme.colors[colorType] = {
          name: color.name,
          // Make sure a COPY of the hues is given to the child color,
          // not the same reference.
          hues: Object.assign({}, color.hues)
        };
      });
    }
    this.THEMES[name] = theme;

    return theme;
  }
}
@NgProvider(MdThemingProvider)
class MdThemingServices extends MdThemingProvider {
  constructor() {
    'ngInject';
    super();
  }
}

@NgModule({
  id: 'ng.material.core.theming1',
  imports: [
    'ng.material.core.meta',
    'ng.material.core.theming.palette'
  ]

})
export default class MaterialCoreTheming {
  static config() {
    'ngInject';
  }
}
(function(module: ng.IModule) {
  module.provider('$mdTheming1', MdThemingServices as any);
})((<NgModule> MaterialCoreTheming).module);
