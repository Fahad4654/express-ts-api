import { Model } from "sequelize-typescript";

export async function findByDynamicId<T extends Model>(
  model: { new (): T } & typeof Model,
  identifiers: Partial<Record<string, string | number>>,
  multiple = false
): Promise<T | T[] | null> {
  // Count how many IDs provided
  const providedKeys = Object.entries(identifiers).filter(
    ([_, v]) => v !== undefined
  );

  if (providedKeys.length !== 1) {
    console.log("Exactly one identifier must be provided");
    throw new Error("Exactly one identifier must be provided");
  }

  const [key, value] = providedKeys[0];
  const whereClause = { [key]: value };

  if (multiple) {
    // Return array of T
    return (await model.findAll({ where: whereClause })) as T[];
  } else {
    // Return single T or null
    return (await model.findOne({ where: whereClause })) as T | null;
  }
}
