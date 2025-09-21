import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GigSeekerDashboard from "@/pages/gig-seeker-dashboard";
import GigPosterDashboard from "@/pages/gig-poster-dashboard";
import VideoCallPage from "@/pages/video-call";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard/seeker" component={GigSeekerDashboard} />
      <Route path="/dashboard/poster" component={GigPosterDashboard} />
      <Route path="/video-call/:roomId">
        {(params) => <VideoCallPage params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
