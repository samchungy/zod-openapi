import type {
  ZodEffects,
  ZodFirstPartyTypeKind,
  ZodType,
  ZodTypeAny,
  input,
  output,
} from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import type { Effect, ResolvedEffect } from '../../components';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createTransformSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodTransform: ZodEffects<T, Output, Input>,
  state: SchemaState,
): Schema => {
  if (zodTransform._def.openapi?.effectType === 'output') {
    return {
      type: 'schema',
      schema: createManualOutputTransformSchema(zodTransform, state),
    };
  }

  if (
    zodTransform._def.openapi?.effectType === 'input' ||
    zodTransform._def.openapi?.effectType === 'same'
  ) {
    return createSchemaObject(zodTransform._def.schema, state, [
      'transform input',
    ]);
  }

  if (state.type === 'output') {
    return {
      type: 'schema',
      schema: createManualOutputTransformSchema(zodTransform, state),
    };
  }

  const schema = createSchemaObject(zodTransform._def.schema, state, [
    'transform input',
  ]);

  return {
    ...schema,
    effects: flattenEffects([
      [
        {
          type: 'schema',
          creationType: 'input',
          zodType: zodTransform,
          path: [...state.path],
        },
      ],
      schema.effects,
    ]),
  };
};

export const createManualOutputTransformSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodTransform: ZodEffects<T, Output, Input>,
  state: SchemaState,
): oas31.SchemaObject => {
  if (!zodTransform._def.openapi?.type) {
    const zodType = zodTransform.constructor.name;
    const schemaName = `${zodType} - ${zodTransform._def.effect.type}`;
    throw new Error(
      `Failed to determine a type for ${schemaName} at ${state.path.join(
        ' > ',
      )}. Please change the 'effectType' to 'input', wrap it in a ZodPipeline or assign it a manual 'type'.`,
    );
  }

  return {
    type: zodTransform._def.openapi.type,
  };
};

const getZodTypeName = (zodType: ZodType): string => {
  if (isZodType(zodType, 'ZodEffects')) {
    return `${zodType._def.typeName} - ${zodType._def.effect.type}`;
  }
  return (zodType._def as { typeName: ZodFirstPartyTypeKind }).typeName;
};

export const throwTransformError = (effect: ResolvedEffect) => {
  const typeName = getZodTypeName(effect.zodType);
  const input = effect.creationType;
  const opposite = input === 'input' ? 'output' : 'input';
  throw new Error(
    `The ${typeName} at ${effect.path.join(
      ' > ',
    )} is used within a registered compoment schema${
      effect.component ? ` (${effect.component.ref})` : ''
    } and contains an ${input} transformation${
      effect.component
        ? ` (${getZodTypeName(
            effect.component.zodType,
          )}) defined at ${effect.component.path.join(' > ')}`
        : ''
    } which is also used in an ${opposite} schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on one of the transformations to \`same\` (Not applicable for ZodDefault), \`input\` or \`output\` eg. \`.openapi({type: 'same'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregister the component containing the transformation`,
  );
};

const resolveSingleEffect = (
  effect: Effect,
  state: SchemaState,
): ResolvedEffect | undefined => {
  if (effect.type === 'schema') {
    return {
      creationType: effect.creationType,
      path: effect.path,
      zodType: effect.zodType,
    };
  }

  if (effect.type === 'component') {
    if (state.visited.has(effect.zodType)) {
      return;
    }
    const component = state.components.schemas.get(effect.zodType);
    if (component?.type !== 'complete') {
      throw new Error('Something went wrong, component schema is not complete');
    }

    if (component.resolvedEffect) {
      return {
        creationType: component.resolvedEffect.creationType,
        path: effect.path,
        zodType: effect.zodType,
        component: {
          ref: component.ref,
          zodType: component.resolvedEffect.zodType,
          path: component.resolvedEffect.path,
        },
      };
    }

    if (!component.effects) {
      return undefined;
    }

    state.visited.add(effect.zodType);
    const resolved = resolveEffect(component.effects, state);
    state.visited.delete(effect.zodType);

    if (!resolved) {
      return undefined;
    }

    component.resolvedEffect = resolved;

    return resolved;
  }

  return undefined;
};

export const resolveEffect = (
  effects: Effect[],
  state: SchemaState,
): ResolvedEffect | undefined => {
  const { input, output } = effects.reduce(
    (acc, effect) => {
      const resolvedSchemaEffect = resolveSingleEffect(effect, state);
      if (resolvedSchemaEffect?.creationType === 'input') {
        acc.input.push(resolvedSchemaEffect);
      }
      if (resolvedSchemaEffect?.creationType === 'output') {
        acc.output.push(resolvedSchemaEffect);
      }

      if (
        resolvedSchemaEffect &&
        acc.input.length > 1 &&
        acc.output.length > 1
      ) {
        throwTransformError(resolvedSchemaEffect);
      }
      return acc;
    },
    { input: [], output: [] } as {
      input: ResolvedEffect[];
      output: ResolvedEffect[];
    },
  );

  if (input.length > 0) {
    return input[0];
  }

  if (output.length > 0) {
    return output[0];
  }

  return undefined;
};

export const verifyEffects = (effects: Effect[], state: SchemaState) => {
  const resolved = resolveEffect(effects, state);
  if (resolved?.creationType && resolved.creationType !== state.type) {
    throwTransformError(resolved);
  }
};

export const flattenEffects = (effects: Array<Effect[] | undefined>) => {
  const allEffects = effects.reduce<Effect[]>((acc, effect) => {
    if (effect) {
      return acc.concat(effect);
    }
    return acc;
  }, []);
  return allEffects.length ? allEffects : undefined;
};
