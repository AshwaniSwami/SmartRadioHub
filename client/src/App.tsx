import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import EnhancedLanding from "@/pages/EnhancedLanding";
import Dashboard from "@/pages/Dashboard";
import Scripts from "@/pages/Scripts";
import SimpleScriptEditor from "@/pages/SimpleScriptEditor";
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
          <Route path="/" component={Dashboard} />
          <Route path="/scripts" component={Scripts} />
          <Route path="/scripts/new" component={SimpleScriptEditor} />
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
