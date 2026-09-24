import * as fabric from 'fabric';

fabric.FabricObject.ownDefaults.originX = 'left';
fabric.FabricObject.ownDefaults.originY = 'top';

/**
 * Create a Fabric 7 subclass from the editor's legacy prototype definition.
 * Fabric 7 removed fabric.util.createClass, so initialize the native parent
 * first and then run the subclass initializer with the original arguments.
 */
export function createFabricClass(Parent, properties, options = {}) {
  const {
    register = true,
    type: classType = properties.type,
    getSuperArgs = (args) => args,
  } = options;
  const { initialize, type, ...prototypeProperties } = properties;

  class CustomClass extends Parent {
    constructor(...args) {
      super(...getSuperArgs(args));

      if (initialize) {
        initialize.call(this, ...args);
      }
    }

    callSuper(method, ...args) {
      const parentMethod = Parent.prototype[method];
      return parentMethod ? parentMethod.apply(this, args) : undefined;
    }
  }

  Object.defineProperties(
    CustomClass.prototype,
    Object.getOwnPropertyDescriptors(prototypeProperties)
  );
  CustomClass.type = classType;

  if (register) {
    fabric.classRegistry.setClass(CustomClass);
  }

  return CustomClass;
}
