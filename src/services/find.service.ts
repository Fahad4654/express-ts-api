import { Model } from "sequelize-typescript";
import { FindOptions } from "sequelize";

interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Generic function to find model instances by a single dynamic identifier.
 * Supports fetching single or multiple records, with optional pagination.
 *
 * @param model - Sequelize model class
 * @param identifiers - Object containing exactly one key-value pair to filter by
 * @param multiple - Whether to return multiple records (default: false)
 * @param page - Current page number (used only when multiple = true)
 * @param pageSize - Number of records per page (used only when multiple = true)
 * @returns Single instance, array of instances, or paginated object
 */
export async function findByDynamicId<T extends Model>(
  model: { new (): T } & typeof Model,
  identifiers: Partial<Record<string, string | number>>,
  multiple = false,
  page = 1,
  pageSize = 10
): Promise<T | T[] | PaginationResult<T> | null> {
  // Filter out undefined values
  const providedKeys = Object.entries(identifiers).filter(([_, v]) => v !== undefined);

  if (providedKeys.length !== 1) {
    throw new Error("Exactly one valid identifier must be provided");
  }

  const [key, value] = providedKeys[0];
  const whereClause = { [key]: value };

  if (multiple) {
    const offset = (page - 1) * pageSize;

    const { rows, count } = await model.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset,
    } as FindOptions);

    return {
      data: rows as T[],
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  } else {
    return (await model.findOne({ where: whereClause } as FindOptions)) as T | null;
  }
}
