import { NextRequest, NextResponse } from "next/server";
import { perfumes } from "@/lib/perfumes";

export function GET(request: NextRequest) {
  const family = request.nextUrl.searchParams.get("family");
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  const sort = request.nextUrl.searchParams.get("sort");

  let results = perfumes.filter((perfume) =>
    (!family || family === "All" || perfume.family === family) &&
    (!query || perfume.name.toLowerCase().includes(query))
  );

  if (sort === "low") results = [...results].sort((a, b) => a.price - b.price);
  if (sort === "high") results = [...results].sort((a, b) => b.price - a.price);

  return NextResponse.json(results);
}
