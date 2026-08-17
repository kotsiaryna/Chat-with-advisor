import { NextResponse } from "next/server";
import { getMeetings } from "@/lib/meetings";

export function GET() {
  return NextResponse.json(getMeetings());
}
