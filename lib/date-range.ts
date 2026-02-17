export function buildDateRange(params: URLSearchParams) {
  const period = params.get("period");
  const value = params.get("value");
  const from = params.get("from");
  const to = params.get("to");

  if (from || to) {
    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  if (period === "month" && value) {
    const start = new Date(`${value}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { gte: start, lt: end };
  }

  if (period === "year" && value) {
    return {
      gte: new Date(`${value}-01-01`),
      lt: new Date(`${Number(value) + 1}-01-01`),
    };
  }

  return undefined;
}
