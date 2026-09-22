"use client";

import { useState } from "react";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ParentProfile } from "./parent/parent-types";
import { ParentProfileSidebar } from "./parent/parent-profile-sidebar";
import { ParentProfileDetails } from "./parent/parent-profile-details";

interface ProfileClientProps {
  profile: ParentProfile;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in duration-300">
        <ParentProfileSidebar
          profile={profile}
          onOpenPasswordDialog={() => setShowPasswordDialog(true)}
        />
        <ParentProfileDetails profile={profile} />
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </>
  );
}
