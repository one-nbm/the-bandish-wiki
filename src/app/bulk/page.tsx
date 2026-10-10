import { getUserRole } from "@/app/actions";
import { redirect } from "next/navigation";
import BulkUploadClient from "./BulkUploadClient";

export default async function BulkUploadPage() {
  const role = await getUserRole();
  if (role !== "admin") {
    redirect("/editor");
  }

  return <BulkUploadClient />;
}