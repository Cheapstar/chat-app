import { NextResponse } from "next/server";

import { uploadImageToCloudinary } from "@repo/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.userId) {
      return NextResponse.json(
        {
          error: "Invalid User/Bad request",
        },
        {
          status: 404,
        }
      );
    }

    const body: FormData = await req.formData();
    const file = body.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No File Present to Upload" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadImageToCloudinary(buffer, {
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    });

    return NextResponse.json({ public_Id: upload }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Upload the Image" },
      { status: 503 }
    );
  }
}
