import { NextResponse } from "next/server";

import { uploadImageToCloudinary } from "@repo/cloudinary";

export async function POST(req: Request) {
  try {
    const body: FormData = await req.formData();
    const file = body.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No File Present to Upload" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadImageToCloudinary(buffer);

    return NextResponse.json({ public_Id: upload }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Upload the Image" },
      { status: 503 }
    );
  }
}
