import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export const metadata = { title: "بحث" };

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="pt-8 text-muted">بيبحث...</p>}>
      <SearchResults />
    </Suspense>
  );
}
