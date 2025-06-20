import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import EnhancedLanding from "@/pages/EnhancedLanding";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import EnhancedScripts from "@/pages/EnhancedScripts";
import EnhancedProjects from "@/pages/EnhancedProjects";
import SimpleScriptEditor from "@/pages/SimpleScriptEditor";
import SimpleScriptCreator from "@/pages/SimpleScriptCreator";
import ScriptViewer from "@/pages/ScriptViewer";
import NotFound from "@/pages/not-found";
import ThemeProvider from "@/components/ThemeProvider";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={EnhancedLanding} />
      ) : (
        <>
          <Route path="/" component={EnhancedDashboard} />
          <Route path="/scripts" component={EnhancedScripts} />
          <Route path="/projects" component={EnhancedProjects} />
          <Route path="/scripts/new" component={SimpleScriptCreator} />
          <Route path="/scripts/:id" component={ScriptViewer} />
          <Route path="/scripts/:id/edit" component={SimpleScriptEditor} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
