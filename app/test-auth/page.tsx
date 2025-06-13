import { auth } from "@/lib/auth";
import { RoleGate } from "@/components/auth/role-gate";
import { UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TestAuthPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {session?.user?.name}
            </p>
            <p>
              <strong>Email:</strong> {session?.user?.email}
            </p>
            <p>
              <strong>Role:</strong> {userRole || "Not logged in"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role-Based Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Admin Only Content:</h3>
            <RoleGate allowedRoles={[UserRole.ADMIN]}>
              <div className="p-4 bg-green-100 rounded-lg">
                This content is only visible to admins!
              </div>
            </RoleGate>
          </div>

          <div>
            <h3 className="font-semibold mb-2">User Content:</h3>
            <RoleGate allowedRoles={[UserRole.USER]}>
              <div className="p-4 bg-blue-100 rounded-lg">
                This content is visible to regular users!
              </div>
            </RoleGate>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Both Admin and User Content:</h3>
            <RoleGate allowedRoles={[UserRole.ADMIN, UserRole.USER]}>
              <div className="p-4 bg-yellow-100 rounded-lg">
                This content is visible to both admins and users!
              </div>
            </RoleGate>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
