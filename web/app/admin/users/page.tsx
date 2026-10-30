"use client";

import { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .adminUsers({
        ...(role ? { role } : {}),
        ...(search ? { search } : {}),
      })
      .then((r) => {
        setUsers(r.users || []);
        setTotal(r.total || 0);
      })
      .catch(() => {
        setUsers([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      await api.adminSetUserStatus(id, status);
      load();
    } catch {
      // show error inline is enough for admin tooling
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <WelcomeHeader
        title="Users"
        subtitle={`${total} accounts. Suspend abusive accounts or reactivate them.`}
      />
      <Card className="mt-6 p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search email or name"
            className="w-64 rounded-xl border border-ink-200 px-4 py-2.5 text-[14px] outline-none focus:border-brand"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-[14px]"
          >
            <option value="">All roles</option>
            <option value="brand">Brand</option>
            <option value="creator">Creator</option>
            <option value="professional">Professional</option>
          </select>
          <Button size="md" variant="outline" onClick={load}>
            Filter
          </Button>
        </div>
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-[14px] text-ink-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink-100 text-[12px] uppercase text-ink-400">
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">
                      {u.email}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || "–"}
                    </td>
                    <td className="py-3 pr-4 capitalize text-ink-700">
                      {u.role}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                          u.status === "active"
                            ? "bg-green-100 text-green-800"
                            : u.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.role !== "admin" &&
                        (u.status === "suspended" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === u.id}
                            onClick={() => setStatus(u.id, "active")}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === u.id}
                            onClick={() => setStatus(u.id, "suspended")}
                          >
                            Suspend
                          </Button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
