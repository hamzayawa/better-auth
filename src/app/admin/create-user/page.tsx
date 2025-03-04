import { CreateUserForm } from "@/components/admin/create-user-form"

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create User</h3>
        <p className="text-sm text-muted-foreground">Add a new user to the system</p>
      </div>
      <div className="max-w-2xl">
        <CreateUserForm />
      </div>
    </div>
  )
}

