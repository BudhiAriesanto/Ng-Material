export const method = (target: any, propertyName: string, propertyDesciptor: PropertyDescriptor) => {
  Reflect.defineMetadata('ngMaterial::method', true, target[propertyName]);
  // if (propertyDesciptor.value instanceof Array) {
      // const inst = propertyDesciptor.value as any; // [propertyDesciptor.value.length - 1];
      // inst.constructor.prototype.__metadataMethod__ = true;
  // }
  return target;
};
const prototypeToObject = (prototype: any, instance: any) => {
  const srv: any = {};
  const __proto__: Array<string> = Object.getOwnPropertyNames(prototype).filter(key => key !== 'constructor');
  __proto__.forEach((key: string) => {
    if ( Reflect.getMetadata('ngMaterial::method', prototype[key]) ) {
      if (/** check ng-annotation */ prototype[key] instanceof Array ) {
        const a = prototype[key];
        const annotate =  a.filter(( value: any ) => typeof value === 'string' ?  true : false);
        srv[key] = [...annotate, (...args: any) => (_this => a[a.length - 1].apply(_this, args))(instance)];
      } else {
        srv[key] = (...args: any) => (_this => prototype[key].apply(_this, args))(instance);
      }
      instance[key] = srv[key];
    } else {
      instance[key] = (...args: any) => (_this => prototype[key].apply(_this, args))(instance);
    }
  });
  return srv;
};
export const NgService = (/** Service name */ name?: string) => (target: Function) => {
  const original = target;
  function construct(constructor: any, args: any) {
    const fn: any = function () {
        return constructor.apply(this, args);
    };
    fn.prototype = constructor.prototype;
    return new fn();
  }
  const f: any = function (...args: any) {
    const instance = construct(original, args);
    Object.assign(instance, this);
    const srv: any = {};
    const { prototype } = original;
    const __proto__: Array<string> = Object.getOwnPropertyNames(prototype).filter(key => key !== 'constructor');
    __proto__.filter((key: string) => {
      if ( Reflect.getMetadata('ngMaterial::method', prototype[key]) ) {
        if (/** check ng-annotation */ prototype[key] instanceof Array ) {
          const a = prototype[key];
          const annotate =  a.filter(( value: any ) => typeof value === 'string' ?  true : false);
          srv[key] = [...annotate, (...args: any) => (_this => a[a.length - 1].apply(_this, args))(instance)];
        } else {
          srv[key] = (...args: any) => (_this => prototype[key].apply(_this, args))(instance);
        }
      } else {
        // add to this for extend class
        // instance[key] = (...args: any) => (_this => original.prototype[key].apply(_this, args))(instance);
      }
      return false;
    });
    return srv;
  };
  if (name) {
    Reflect.defineMetadata('custom:name', name, f);
  }
  // target.constructor.apply(undefined);
  f.$inject = target.$inject;
  return f;
};


export const NgProvider = (/** Service name */ classOfProvider: any) => (target: Function) => {
  const original = target;
  function construct(constructor: any, args: any) {
    const fn: any = function () {
        return constructor.apply(this, args);
    };
    fn.prototype = constructor.prototype;
    return new fn();
  }

  const fnProvider: any = (...args: any) => {
    let instance = construct(classOfProvider, args);
    let { prototype } = classOfProvider;
    const srv: any = prototypeToObject(prototype, instance);
    const fn = (...args: any) => {
      Object.assign(instance, construct(original, args));
      return prototypeToObject(original.prototype, instance);
    };
    fn.$inject = original.$inject;
    srv.$get = fn;
    return srv;
  };
  fnProvider.$inject = ['$injector'];
  return fnProvider;
};
