import { createHashRouter } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import ErrorBoundary from "./pages/(errors)/ErrorBoundary";
import NotFound from "./pages/(errors)/NotFound";
import DetailPage from "./pages/detail/[id]";
import RootPage from "./pages/(root)/page";
import SettingsPage from "./pages/settings";
import DescribePage from "./pages/detail/[id]/describe";

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
                children: [
                    {
                        index: true,
                        element: <DetailPage />
                    },
                    {
                        path: "describe",
                        element: <DescribePage />
                    },
                ]
            },
            {
                path: "/settings",
                element: <SettingsPage />
            }
        ]
    }
])

export default router