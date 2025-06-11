import { Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A sign-in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to sign in to your account. 
            You may close this window.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}