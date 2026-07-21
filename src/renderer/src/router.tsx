import { createHashRouter } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import ErrorBoundary from "./pages/(errors)/ErrorBoundary";
import NotFound from "./pages/(errors)/NotFound";
import { lazy } from "react";
import DetailPage from "./pages/detail/[id]";
import RootPage from "./pages/(root)/page";

const router = createHashRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: (
            <ErrorBoundary fallback={<NotFound />}><NotFound /></ErrorBoundary>
        ),
        children: [
            {
                index: true,
                element: <RootPage />
            },
            {
                path: "/detail/:id",
                element: <DetailPage />
            }
        ]
    }
])

export default router