import { Contents } from "../models/Contents";

export async function findAllContents(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Contents.findAndCountAll({
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
  });
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

export async function createContent(data: Partial<Contents>) {
  return Contents.create(data);
}

export async function updateContentById(
  id: string,
  updates: Partial<Contents>
) {
  const content = await Contents.findOne({ where: { id } });
  if (!content) throw new Error("Content not found");

  const allowedFields: Array<keyof Contents> = [
    "userId",
    "name",
    "text",
    "type",
    "mediaUrl",
    "status",
    "exclusive",
    "createdBy",
    "updatedBy",
  ];

  const filteredUpdates: Partial<Contents> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0)
    throw new Error("No valid fields provided for update");

  await content.update(filteredUpdates);

  return Contents.findByPk(id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}

export async function deleteContentById(id: string) {
  const deletedCount = await Contents.destroy({ where: { id } });
  if (deletedCount === 0) throw new Error("Content not found");
  return deletedCount;
}
