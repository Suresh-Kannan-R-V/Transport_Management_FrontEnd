/* eslint-disable @typescript-eslint/no-unused-vars */
import { HeroUIProvider } from "@heroui/react";
import { AppRoutes } from "./routes/routes";

function App() {
  return (
    <HeroUIProvider>
      <AppRoutes />
    </HeroUIProvider>
  );
}

export default App;
