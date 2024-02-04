import type { ZodEffects, ZodType, ZodTypeAny, input, output } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
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

export const throwTransformError = (zodType: ZodType, path: string[]) => {
  throw new Error(
    `${JSON.stringify(zodType)} at ${path.join(
      ' > ',
    )} is used within a registered compoment schema and contains a transformation but is used in both an input schema and output schema. This may cause the schema to render incorrectly and is most likely a mistake. Set an \`effectType\`, wrap it in a ZodPipeline or assign it a manual type to resolve the issue.`,
  );
};

export const resolveEffect = (
  effects: Array<Schema['effect']>,
): Schema['effect'] | undefined => {
  const { input, output } = effects.reduce(
    (acc, effect) => {
      if (effect?.type === 'input') {
        acc.input.push(effect);
      }
      if (effect?.type === 'output') {
        acc.output.push(effect);
      }

      if (effect && acc.input.length > 1 && acc.output.length > 1) {
        throwTransformError(effect.zodType, effect.path);
      }
      return acc;
    },
    { input: [], output: [] } as {
      input: Array<Schema['effect']>;
      output: Array<Schema['effect']>;
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
