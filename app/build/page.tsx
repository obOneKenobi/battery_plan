import { Suspense } from "react";
import BuildPage from "./BuildPage";

export default function Page() {
    return (
        <Suspense>
            <BuildPage />
        </Suspense>
    );
}
