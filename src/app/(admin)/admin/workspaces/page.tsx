"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Search,
  Shield,
  ShieldOff,
  Ban,
  Trash2,
  Coins,
  UserCog,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserConfig {
  isAdmin?: boolean;
  isBlocked?: boolean;
  [key: string]: unknown;
}

interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  creditsBalance: number;
  config: UserConfig | null;
  createdAt: string;
  _count: {
    decks: number;
    sessions: number;
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WorkspacesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit credits dialog
  const [creditsUser, setCreditsUser] = useState<AdminUser | null>(null);
  const [creditsValue, setCreditsValue] = useState("");
  const [creditsLoading, setCreditsLoading] = useState(false);

  // Delete confirmation dialog
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspaces");
      if (!res.ok) throw new Error("Failed to load workspaces");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  });

  async function patchUser(userId: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/workspaces/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Update failed");
    }
    return res.json();
  }

  async function handleToggleAdmin(user: AdminUser) {
    const current = user.config?.isAdmin ?? false;
    try {
      await patchUser(user.id, { isAdmin: !current });
      toast.success(`${user.name} is ${!current ? "now an admin" : "no longer an admin"}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, config: { ...u.config, isAdmin: !current } }
            : u
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleToggleBlock(user: AdminUser) {
    const current = user.config?.isBlocked ?? false;
    try {
      await patchUser(user.id, { isBlocked: !current });
      toast.success(`${user.name} has been ${!current ? "blocked" : "unblocked"}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, config: { ...u.config, isBlocked: !current } }
            : u
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleSaveCredits() {
    if (!creditsUser) return;
    const val = Number(creditsValue);
    if (isNaN(val) || val < 0) {
      toast.error("Enter a valid credit amount");
      return;
    }
    setCreditsLoading(true);
    try {
      await patchUser(creditsUser.id, { creditsBalance: val });
      toast.success(`Credits updated to ${val} for ${creditsUser.name}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === creditsUser.id ? { ...u, creditsBalance: val } : u
        )
      );
      setCreditsUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update credits");
    } finally {
      setCreditsLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/workspaces/${deleteUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Delete failed");
      }
      toast.success(`Workspace for ${deleteUser.name} deleted`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Workspaces</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {loading ? "Loading…" : `${users.length} total user${users.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
          />
        </div>

        {/* Table */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UserCog className="size-10 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400">No users found</p>
                {search && (
                  <p className="text-xs text-zinc-600 mt-1">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Decks
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => {
                      const isBlocked = user.config?.isBlocked ?? false;
                      const isAdminUser = user.config?.isAdmin ?? false;
                      const rowBg = i % 2 === 1 ? "bg-zinc-800/30" : "";

                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-zinc-800/60 last:border-0 transition-colors hover:bg-zinc-800/50 ${rowBg}`}
                        >
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-medium text-white truncate max-w-[180px]">
                                {user.name}
                              </span>
                              <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                                {user.email}
                              </span>
                            </div>
                          </td>

                          {/* Credits */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <Coins className="size-3.5 text-zinc-500 shrink-0" />
                              <span className="tabular-nums">
                                {user.creditsBalance.toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Decks */}
                          <td className="px-4 py-3 text-zinc-300 tabular-nums">
                            {user._count.decks}
                          </td>

                          {/* Sessions */}
                          <td className="px-4 py-3 text-zinc-300 tabular-nums">
                            {user._count.sessions}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {isBlocked ? (
                              <Badge className="bg-red-900/50 text-red-400 border-red-800 text-xs">
                                Blocked
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800 text-xs">
                                Active
                              </Badge>
                            )}
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3">
                            {isAdminUser ? (
                              <Badge className="bg-indigo-900/50 text-indigo-400 border-indigo-800 text-xs gap-1">
                                <Shield className="size-3" />
                                Admin
                              </Badge>
                            ) : (
                              <span className="text-xs text-zinc-600">User</span>
                            )}
                          </td>

                          {/* Joined */}
                          <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-zinc-500 hover:text-white hover:bg-zinc-700"
                                >
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-zinc-900 border-zinc-700 text-zinc-200"
                              >
                                <DropdownMenuItem
                                  className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer"
                                  onSelect={() => {
                                    setCreditsUser(user);
                                    setCreditsValue(String(user.creditsBalance));
                                  }}
                                >
                                  <Coins className="size-4 text-zinc-400" />
                                  Edit Credits
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer"
                                  onSelect={() => handleToggleAdmin(user)}
                                >
                                  {isAdminUser ? (
                                    <>
                                      <ShieldOff className="size-4 text-zinc-400" />
                                      Remove Admin
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="size-4 text-zinc-400" />
                                      Make Admin
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer"
                                  onSelect={() => handleToggleBlock(user)}
                                >
                                  <Ban className="size-4 text-zinc-400" />
                                  {isBlocked ? "Unblock" : "Block"}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-zinc-700" />

                                <DropdownMenuItem
                                  className="gap-2 focus:bg-red-900/60 focus:text-red-400 text-red-500 cursor-pointer"
                                  onSelect={() => setDeleteUser(user)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete Workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Credits Dialog */}
      <Dialog
        open={!!creditsUser}
        onOpenChange={(open) => {
          if (!open) setCreditsUser(null);
        }}
      >
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Credits</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the credit balance for{" "}
              <span className="text-zinc-200 font-medium">
                {creditsUser?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">
                New Balance
              </label>
              <Input
                type="number"
                min={0}
                value={creditsValue}
                onChange={(e) => setCreditsValue(e.target.value)}
                placeholder="0"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setCreditsUser(null)}
                disabled={creditsLoading}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCredits}
                disabled={creditsLoading}
                className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
              >
                {creditsLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
      >
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently delete{" "}
              <span className="text-zinc-200 font-medium">
                {deleteUser?.name}
              </span>
              &apos;s workspace, including all their decks, sessions, and data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteUser(null)}
              disabled={deleteLoading}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? "Deleting…" : "Delete Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
