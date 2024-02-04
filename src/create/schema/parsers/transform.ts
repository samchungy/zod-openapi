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
import type { Effect } from '../../components';
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

  if (zodTransform._def.openapi?.effectType === 'input') {
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
    effect: resolveEffect([
      {
        type: 'input',
        zodType: zodTransform,
        path: [...state.path],
      },
      schema.effect,
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

export const throwTransformError = (effect: Effect) => {
  const typeName = getZodTypeName(effect.zodType);
  const input = effect.type;
  const opposite = input === 'input' ? 'output' : 'input';
  throw new Error(
    `The ${typeName} at ${effect.path.join(
      ' > ',
    )} is used within a registered compoment schema${
      effect.component ? ` (${effect.component.ref})` : ''
    } and contains an ${input} transformation${
      effect.component ? ` defined at ${effect.component.path.join(' > ')}` : ''
    } which is also used in an ${opposite} schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on the transformation to \`${opposite}\` eg. \`.openapi({type: '${opposite}'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregistering the component containing the transformation`,
  );
};

export const resolveEffect = (
  effects: Array<Effect | undefined>,
): Effect | undefined => {
  const { input, output } = effects.reduce(
    (acc, effect) => {
      if (effect?.type === 'input') {
        acc.input.push(effect);
      }
      if (effect?.type === 'output') {
        acc.output.push(effect);
      }

      if (effect && acc.input.length > 1 && acc.output.length > 1) {
        throwTransformError(effect);
      }
      return acc;
    },
    { input: [], output: [] } as {
      input: Effect[];
      output: Effect[];
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
