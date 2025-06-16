import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Users, FileText, Mic } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
              <Radio className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">SMART Radio</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your radio content workflow with our comprehensive Content Management Platform
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Script Management</CardTitle>
              <CardDescription>
                Create, edit, and manage all your radio scripts in one centralized location
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Collaborative Workflow</CardTitle>
              <CardDescription>
                Multi-stage approval process with role-based permissions for your team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Recording Tracking</CardTitle>
              <CardDescription>
                Track recordings, broadcast dates, and archive completed episodes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login CTA */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in to access your content management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
              size="lg"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
